# Context-Aware AI Coaching - AI Trainer

## Overview

The AI trainer now uses advanced conversation context analysis to provide more personalized, coherent, and meaningful responses. The system remembers previous messages, understands user goals, and maintains conversation continuity across sessions.

## How Context Awareness Works

### 🧠 Conversation Memory

The AI coach now has access to:
- **Recent conversation history** (last 8 messages)
- **User profile data** (goals, fitness level, equipment, preferences)
- **Session information** (duration, message count, activity)
- **Conversation flow** (what was discussed previously)

### 🔄 Dynamic Context Building

Each message sent to the AI includes:

1. **System Prompt** - Personalized instructions based on user profile
2. **Conversation History** - Recent messages for context
3. **Current Message** - The user's latest input
4. **Session Metadata** - Time, activity level, conversation length

## Features

### 📚 Conversation Continuity

The AI can now:
- ✅ **Remember previous discussions** about goals and challenges
- ✅ **Reference past workout recommendations** and modify them
- ✅ **Track progress mentions** and provide follow-up advice
- ✅ **Understand context** of "it", "that exercise", "what you mentioned before"
- ✅ **Maintain topic flow** across multiple messages and sessions

### 🎯 Personalized Responses

Based on user profile, the AI provides:
- **Goal-specific advice** (weight loss, muscle gain, endurance)
- **Equipment-aware suggestions** (home gym, body weight, full gym)
- **Level-appropriate guidance** (beginner, intermediate, advanced)
- **Limitation-conscious recommendations** (injuries, time constraints)

### 🕒 Session Awareness

The AI understands:
- **Session length** - Provides appropriate detail for short vs long chats
- **Message frequency** - Adapts communication style
- **Return behavior** - Acknowledges breaks in conversation
- **Activity patterns** - Remembers user's typical interaction style

## Technical Implementation

### Context Data Structure

```typescript
interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface ChatRequest {
  user_id: string;
  session_id: string;
  message: string;
  conversation_history: ConversationMessage[];
  user_profile: UserProfile;
  context_settings: {
    include_recent_messages: 8;
    include_session_summary: true;
    max_context_tokens: 3000;
  };
}
```

### System Prompt Generation

The system automatically builds personalized prompts:

```typescript
// Example generated system prompt:
"Ты виртуальный фитнес-тренер и нутрициолог. 
Профиль пользователя: возраст 30 лет, пол Мужской, 
рост 191см, вес 97кг, цели: Набор мышечной массы, 
уровень подготовки: Продвинутый, 
доступное оборудование: Штанга, Тренажерный зал, 
цель по питанию: Набор мышечной массы.
Текущая сессия: 15 минут, 8 сообщений.
Отвечай персонализированно, учитывая контекст всего разговора."
```

### Context Processing

```typescript
const buildConversationContext = (
  messages: ChatMessage[], 
  currentMessage: string,
  userProfile?: any,
  sessionInfo?: ChatSession
): ConversationMessage[] => {
  // 1. Build system prompt with user data
  // 2. Add recent conversation history (8 messages)
  // 3. Filter out welcome and empty messages
  // 4. Include current message
  // 5. Return structured context array
};
```

## User Experience Improvements

### 🗣️ More Natural Conversations

**Before (without context):**
```
User: "Можешь посоветовать упражнения для груди?"
AI: "Конечно! Вот упражнения для груди: жим лежа, отжимания..."

User: "А что насчет того, что мы обсуждали вчера?"
AI: "Извините, не помню о чем мы говорили. Можете уточнить?"
```

**After (with context):**
```
User: "Можешь посоветовать упражнения для груди?"
AI: "Учитывая твою цель набора массы и доступ к штанге, рекомендую..."

User: "А что насчет того, что мы обсуждали вчера?"
AI: "Ты имеешь в виду программу жима лежа, которую мы составляли? 
Да, можем продолжить работу над ней..."
```

### 💡 Intelligent Follow-ups

The AI now provides:
- **Progress tracking**: "Как прошла тренировка груди, которую мы планировали?"
- **Goal alignment**: "Это хорошо сочетается с твоей целью набора массы"
- **Contextual suggestions**: "Основываясь на твоих предыдущих вопросах о питании..."

### 🎨 Visual Context Indicators

Users can see when context is active:
- 🧠 **"Контекстная память активна"** - in chat header
- 🧠 **"Анализирует контекст..."** - during message processing
- 📚 **"История чата загружена"** - when previous messages available

## Context Optimization

### Memory Management

- **Message Limit**: 8 recent messages to balance context and performance
- **Token Optimization**: Maximum 3000 tokens for context to prevent overflow
- **Smart Filtering**: Excludes welcome messages and empty responses
- **Session Grouping**: Context resets after 4 hours of inactivity

### Performance Considerations

- **Async Processing**: Context building doesn't block UI
- **Selective History**: Only relevant messages included
- **Efficient Storage**: localStorage used for message persistence
- **Debug Logging**: Console logs show context usage

## Examples of Context Usage

### Goal-Driven Conversations

```typescript
// AI remembers user's goals from profile
User Profile: { goals: ["Набор мышечной массы"], fitness_level: "Продвинутый" }

User: "Хочу поменять программу"
AI: "Понял! Учитывая твою цель набора массы и продвинутый уровень, 
     какой аспект текущей программы хочешь изменить?"
```

### Equipment-Aware Suggestions

```typescript
// AI knows available equipment
User Profile: { equipment: ["Штанга", "Тренажерный зал"] }

User: "Альтернатива жиму лежа?"
AI: "С твоим доступом к залу и штанге, попробуй жим гантелей 
     или жим в машине Смита для другого угла нагрузки"
```

### Conversation Flow Tracking

```typescript
// AI tracks conversation topics
Previous Messages: [
  "User: Болит плечо после вчерашней тренировки",
  "AI: Рекомендую отдых и легкую растяжку..."
]

Current Message: "Уже лучше, можно тренироваться?"
AI: "Отлично, что плечо стало лучше! Начни с легких весов 
     и избегай упражнений над головой еще несколько дней"
```

## Benefits

### For Users
- 🎯 **More relevant advice** based on their specific situation
- 🔗 **Conversation continuity** - no need to repeat context
- 📈 **Progressive guidance** - AI builds on previous discussions
- 🤝 **Personal connection** - feels like talking to a real trainer

### For Developers  
- 📊 **Better user engagement** - more meaningful conversations
- 🐛 **Easier debugging** - context logs show what AI knows
- 🔧 **Configurable system** - easy to adjust context settings
- 📱 **Scalable design** - works across sessions and devices

## Monitoring and Analytics

### Context Metrics

The system tracks:
- **Context usage frequency** - how often history is included
- **Message relevance** - quality of contextual responses
- **Session continuity** - conversation flow across time
- **User satisfaction** - engagement with contextual responses

### Debug Information

Console logs provide:
```javascript
// Example debug output
"Sending message with context: 10 messages (system + history + current)"
"Context preview: {
  systemPrompt: 'Ты виртуальный фитнес-тренер...',
  historyMessages: 7,
  userProfile: 'goals, fitness_level, equipment'
}"
```

## Best Practices

### For Optimal Context

1. **Complete your profile** - more context = better advice
2. **Be specific in messages** - helps AI understand your needs
3. **Reference previous topics** - AI will connect the dots
4. **Maintain conversation flow** - don't reset unnecessarily

### For Developers

1. **Monitor context size** - keep within token limits
2. **Filter irrelevant messages** - quality over quantity
3. **Test edge cases** - empty profiles, long conversations
4. **Optimize prompts** - clear, concise system instructions

## Future Enhancements

### Planned Features

1. **Long-term memory** - Remember conversations across weeks
2. **Goal progression tracking** - Automatic progress analysis
3. **Predictive suggestions** - Anticipate user needs
4. **Multi-modal context** - Include workout photos, form videos

### Advanced Context

1. **Sentiment analysis** - Understand user mood and motivation
2. **Topic modeling** - Automatically categorize conversation themes
3. **Preference learning** - Adapt style based on user responses
4. **Cross-session insights** - Connect patterns across sessions

This context-aware system transforms the AI trainer from a simple question-answer bot into an intelligent coaching companion that truly understands and remembers the user's fitness journey. 