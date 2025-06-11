"""
Nutrition Service for handling nutrition plans, recipes, and shopping lists
"""
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

@dataclass
class NutritionPlan:
    goal: str
    daily_calories: int
    daily_protein: int
    daily_fats: int
    daily_carbs: int
    days: List[Dict[str, Any]]

@dataclass
class Recipe:
    name: str
    ingredients: List[str]
    instructions: List[str]
    calories: int
    protein: float
    fats: float
    carbs: float
    preparation_time: str
    servings: int
    difficulty: str

@dataclass
class ShoppingList:
    categories: Dict[str, List[Dict[str, str]]]
    total_estimated_cost: float
    week_number: int

class NutritionService:
    def __init__(self, llm_service, user_service):
        self.llm_service = llm_service
        self.user_service = user_service
        # In production, these would be stored in a database
        self._nutrition_plans: Dict[str, NutritionPlan] = {}
        self._shopping_lists: Dict[str, ShoppingList] = {}

    async def generate_nutrition_plan(self, user_id: str) -> Dict[str, Any]:
        """Generate a personalized nutrition plan"""
        user_profile = self.user_service.get_user_profile(user_id)
        
        nutrition_data = {
            "nutrition_goal": user_profile.get("nutrition_goal", ""),
            "daily_calories": user_profile.get("daily_calories", 2000),
            "food_preferences": user_profile.get("food_preferences", []),
            "allergies": user_profile.get("allergies", []),
            "weight": user_profile.get("weight", 70),
            "gender": user_profile.get("gender", ""),
            "fitness_goals": user_profile.get("goals", [])
        }
        
        result = await self.llm_service.generate_nutrition_plan(nutrition_data)
        
        # Store the plan
        self._nutrition_plans[user_id] = NutritionPlan(
            goal=result["plan"].get("goal", ""),
            daily_calories=result["plan"].get("daily_calories", 0),
            daily_protein=result["plan"].get("daily_protein", 0),
            daily_fats=result["plan"].get("daily_fats", 0),
            daily_carbs=result["plan"].get("daily_carbs", 0),
            days=result["plan"].get("days", [])
        )
        
        return result

    def get_nutrition_plan(self, user_id: str) -> Optional[NutritionPlan]:
        """Get user's current nutrition plan"""
        return self._nutrition_plans.get(user_id)

    async def generate_shopping_list(self, user_id: str, week_number: int = 1) -> Dict[str, Any]:
        """Generate a shopping list based on nutrition plan"""
        nutrition_plan = self.get_nutrition_plan(user_id)
        if not nutrition_plan:
            raise ValueError("No nutrition plan found. Please generate a plan first.")
        
        result = await self.llm_service.generate_shopping_list({
            "days": nutrition_plan.days,
            "user_preferences": self.user_service.get_user_profile(user_id)
        })
        
        # Store the shopping list
        self._shopping_lists[user_id] = ShoppingList(
            categories=result["shopping_list"],
            total_estimated_cost=result.get("total_cost", 0.0),
            week_number=week_number
        )
        
        return result

    def get_shopping_list(self, user_id: str) -> Optional[ShoppingList]:
        """Get user's current shopping list"""
        return self._shopping_lists.get(user_id)

    def get_recipes_from_plan(self, user_id: str, limit: int = 5) -> List[Recipe]:
        """Get recipes from the current nutrition plan"""
        nutrition_plan = self.get_nutrition_plan(user_id)
        if not nutrition_plan:
            return []
        
        recipes = []
        for day in nutrition_plan.days:
            for meal in day.get("meals", []):
                for dish in meal.get("dishes", []):
                    recipe = dish.get("recipe")
                    if recipe and len(recipes) < limit:
                        recipes.append(Recipe(
                            name=dish.get("name", ""),
                            ingredients=recipe.get("ingredients", []),
                            instructions=recipe.get("instructions", []),
                            calories=recipe.get("calories", 0),
                            protein=recipe.get("protein", 0),
                            fats=recipe.get("fats", 0),
                            carbs=recipe.get("carbs", 0),
                            preparation_time=recipe.get("prep_time", ""),
                            servings=recipe.get("servings", 1),
                            difficulty=recipe.get("difficulty", "medium")
                        ))
        
        return recipes

    def calculate_macros_distribution(self, calories: int, goal: str) -> Dict[str, int]:
        """Calculate macronutrient distribution based on goal"""
        if goal.lower() in ["набор массы", "mass gain", "muscle gain"]:
            protein_ratio = 0.3  # 30% of calories from protein
            fat_ratio = 0.25     # 25% of calories from fat
            carb_ratio = 0.45    # 45% of calories from carbs
        elif goal.lower() in ["похудение", "weight loss", "fat loss"]:
            protein_ratio = 0.35  # 35% of calories from protein
            fat_ratio = 0.3      # 30% of calories from fat
            carb_ratio = 0.35    # 35% of calories from carbs
        else:  # maintenance
            protein_ratio = 0.3   # 30% of calories from protein
            fat_ratio = 0.3      # 30% of calories from fat
            carb_ratio = 0.4     # 40% of calories from carbs
        
        # Calculate grams of each macronutrient
        # Protein and carbs = 4 calories per gram
        # Fat = 9 calories per gram
        return {
            "protein": int((calories * protein_ratio) / 4),
            "fats": int((calories * fat_ratio) / 9),
            "carbs": int((calories * carb_ratio) / 4)
        }

    def adjust_portions(self, recipe: Recipe, target_calories: int) -> Recipe:
        """Adjust recipe portions to match target calories"""
        if recipe.calories == 0:
            return recipe
        
        ratio = target_calories / recipe.calories
        new_recipe = Recipe(
            name=recipe.name,
            ingredients=recipe.ingredients,
            instructions=recipe.instructions,
            calories=target_calories,
            protein=recipe.protein * ratio,
            fats=recipe.fats * ratio,
            carbs=recipe.carbs * ratio,
            preparation_time=recipe.preparation_time,
            servings=max(1, int(recipe.servings * ratio)),
            difficulty=recipe.difficulty
        )
        
        return new_recipe

    def check_allergies_and_preferences(self, recipe: Recipe, user_id: str) -> bool:
        """Check if recipe matches user's allergies and preferences"""
        user_profile = self.user_service.get_user_profile(user_id)
        allergies = user_profile.get("allergies", [])
        preferences = user_profile.get("food_preferences", [])
        
        # Check allergies
        for allergen in allergies:
            if any(allergen.lower() in ingredient.lower() for ingredient in recipe.ingredients):
                return False
        
        # Check preferences
        if preferences:
            if "вегетарианство" in preferences or "vegetarian" in preferences:
                meat_ingredients = ["meat", "chicken", "beef", "pork", "fish", "мясо", "курица", "говядина", "свинина", "рыба"]
                if any(meat in ingredient.lower() for ingredient in recipe.ingredients for meat in meat_ingredients):
                    return False
            
            if "веганство" in preferences or "vegan" in preferences:
                animal_products = ["meat", "milk", "egg", "honey", "cheese", "мясо", "молоко", "яйца", "мед", "сыр"]
                if any(product in ingredient.lower() for ingredient in recipe.ingredients for product in animal_products):
                    return False
        
        return True 