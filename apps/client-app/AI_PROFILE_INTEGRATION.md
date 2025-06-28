# AI Profile Integration

## Overview
The AI coach chat now automatically includes the user's complete profile data when communicating, enabling personalized recommendations based on individual characteristics, goals, and preferences.

## Profile Data Included in AI Context

### Physical Characteristics
- **Age**: Used for age-appropriate exercise recommendations
- **Gender**: For gender-specific training considerations  
- **Height**: Body composition and exercise scaling
- **Weight**: Training intensity and nutritional calculations

### Fitness Information
- **Goals**: Primary training objectives (e.g., "Набор мышечной массы")
- **Fitness Level**: Current experience level (e.g., "Продвинутый")
- **Equipment**: Available training equipment (e.g., ["Собственный вес", "Штанга", "Тренажерный зал"])
- **Limitations**: Physical restrictions or injuries

### Nutrition Data
- **Nutrition Goal**: Dietary objectives
- **Food Preferences**: Preferred food types
- **Allergies**: Food allergies and restrictions

## Example Profile Context Sent to AI

```json
{
  "age": 30,
  "gender": "Мужской", 
  "height": 191,
  "weight": 97,
  "goals": ["Набор мышечной массы"],
  "fitness_level": "Продвинутый (тренируюсь более года)",
  "equipment": ["Собственный вес", "Штанга", "Тренажерный зал"],
  "limitations": ["Нет ограничений"],
  "nutrition_goal": "Набор мышечной массы",
  "food_preferences": ["Курица", "Рыба"],
  "allergies": ["Нет аллергий"]
}
```

## Technical Implementation

### Frontend Changes
1. **Updated `useChat` hook** to accept user data parameter
2. **Modified `ChatInterface`** to pass user data to chat hook
3. **Enhanced `aiService`** with profile context in chat requests

### Backend Changes  
1. **Extended `ChatRequest` schema** with `UserProfile` model
2. **Enhanced LLM prompt context** with detailed user information
3. **Improved context formatting** for better AI understanding

## AI Context Example

When a user with complete profile sends a message like "Составь мне программу тренировок", the AI receives:

**System Prompt:**
```
[Virtual trainer system prompt]

Контекст клиента: Физические данные: возраст 30 лет, пол Мужской, рост 191 см, вес 97 кг. Цели тренировок: Набор мышечной массы. Уровень подготовки: Продвинутый (тренируюсь более года). Доступное оборудование: Собственный вес, Штанга, Тренажерный зал. Ограничения: Нет ограничений. Питание: цель питания: Набор мышечной массы, предпочтения: Курица, Рыба, аллергии: Нет аллергий.
```

This enables the AI to provide:
- **Personalized workout intensity** based on fitness level
- **Equipment-specific exercises** using available gear
- **Age and gender-appropriate** recommendations
- **Goal-aligned training** programs
- **Nutrition advice** considering preferences and allergies

## Benefits

✅ **Personalized Responses**: AI considers individual characteristics  
✅ **Context-Aware Advice**: Recommendations match user's situation  
✅ **Equipment-Specific**: Exercises use available equipment  
✅ **Goal-Oriented**: Training aligns with stated objectives  
✅ **Safety-Conscious**: Respects limitations and restrictions  
✅ **Nutrition Integration**: Food advice considers preferences/allergies 