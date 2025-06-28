# Chat Session Management - AI Trainer

## Overview

The AI chat interface uses intelligent session management to provide a better user experience while maintaining reasonable session durations and handling inactivity appropriately.

## Session Reset Logic

### Inactivity Timeout

**Timeout Duration**: 4 hours of inactivity

When a user returns to the chat after being inactive for more than 4 hours, the system automatically:

1. ✅ **Preserves chat history** - All previous messages remain accessible
2. 🔄 **Resets session timer** - Creates a new session with current timestamp
3. 📱 **Updates UI indicators** - Shows "Новая сессия" for recently reset sessions
4. 💾 **Saves new session** - Persists the updated session to localStorage

### Session States

#### Active Session
- **Duration**: Less than 4 hours since last activity
- **Display**: Shows actual session time (e.g., "Активная сессия: 25 мин")
- **Behavior**: Continues existing session, updates lastActivity on each message

#### New Session (After Reset)
- **Duration**: Less than 5 minutes old
- **Display**: Shows "Новая сессия" instead of duration
- **Behavior**: Fresh session timer, but retains message history

#### Inactive Session (Auto-Reset)
- **Trigger**: More than 4 hours of inactivity
- **Action**: Automatic reset on next app initialization
- **Log**: Console message with inactivity duration and timeout threshold

## Implementation Details

### Configuration

```typescript
// Configurable timeout in store/index.ts
const SESSION_INACTIVITY_TIMEOUT_HOURS = 4; // Reset after 4 hours
```

### Session Data Structure

```typescript
interface ChatSession {
  sessionId: string;        // Unique session identifier
  userId: string;           // User ID
  startTime: string;        // ISO timestamp of session start
  lastActivity: string;     // ISO timestamp of last activity
  messageCount: number;     // Number of messages in session
}
```

### Reset Logic Flow

1. **App Initialization**
   ```typescript
   initializeChat(userId) {
     // Load existing session
     let session = loadSession(userId);
     
     if (session) {
       const hoursInactive = calculateInactivity(session.lastActivity);
       
       if (hoursInactive > SESSION_INACTIVITY_TIMEOUT_HOURS) {
         // Reset session but keep history
         session = createNewSession(userId, existingHistory);
         console.log(`Session reset: ${hoursInactive}h inactivity`);
       } else {
         // Update activity timestamp
         session.lastActivity = new Date().toISOString();
       }
     }
   }
   ```

2. **Message Activity**
   ```typescript
   sendChatMessage() {
     // Update session activity on each message
     const updatedSession = {
       ...currentSession,
       lastActivity: new Date().toISOString(),
       messageCount: newMessageCount
     };
     saveSession(updatedSession);
   }
   ```

### Duration Formatting

The system uses intelligent duration formatting:

```typescript
const formatSessionDuration = (minutes: number): string => {
  if (minutes < 1) return 'Только что';
  if (minutes < 60) return `${minutes} мин`;
  if (minutes < 1440) return `${hours}ч ${minutes}м`;
  return `${days}д ${hours}ч`;
};
```

**Examples:**
- `0 minutes` → "Только что"
- `15 minutes` → "15 мин"
- `90 minutes` → "1ч 30м"
- `1500 minutes` → "1д 1ч"

## User Interface

### Session Status Display

The chat header shows session information contextually:

```tsx
{hasHistory && sessionInfo && (
  <div className="session-indicator">
    📚 История чата загружена • {sessionInfo.messageCount} сообщений
    {sessionInfo.isNewSession 
      ? ' • Новая сессия' 
      : ` • Активная сессия: ${formatSessionDuration(sessionInfo.duration)}`
    }
  </div>
)}
```

### Visual States

1. **No History**: No indicator shown
2. **New Session**: Shows "Новая сессия" badge
3. **Active Session**: Shows formatted duration
4. **Long Session**: Automatically formats with hours/days

## Benefits

### For Users
- ✅ **No lost conversations** - History always preserved
- ⏰ **Realistic session times** - No more 19+ hour sessions
- 🎯 **Clear status** - Know if session is new or continuing
- 🔄 **Automatic management** - No manual intervention needed

### For Developers
- 🐛 **Easier debugging** - Clear session logs and states
- ⚙️ **Configurable timeout** - Easy to adjust inactivity threshold
- 📊 **Better analytics** - More accurate session duration data
- 🧼 **Cleaner data** - Prevents accumulation of stale sessions

## Testing Scenarios

### Normal Usage
1. Start app → New session created
2. Send messages → Session timer runs normally
3. Leave app for 2 hours → Session continues on return
4. Continue chatting → Duration shows correctly

### Inactivity Reset
1. Start app → Active session loaded
2. Leave app for 6 hours → Exceeds 4-hour timeout
3. Return to app → Session automatically reset
4. Check console → "Session reset: 6.0h inactivity" logged
5. UI shows → "Новая сессия" indicator

### Edge Cases
1. **Browser refresh** → Session persists correctly
2. **Multiple tabs** → Each maintains separate session tracking
3. **LocalStorage full** → Graceful fallback to in-memory session
4. **Clock changes** → Handles system time adjustments

## Troubleshooting

### Session Not Resetting

**Check:**
- Console logs for session initialization
- localStorage contains valid session data
- System clock is accurate

**Debug:**
```javascript
// In browser console
localStorage.getItem('ai_trainer_chat_session_demo-user-001');
```

### Incorrect Duration Display

**Common causes:**
- Cached old session data
- Browser timezone changes
- Manual clock adjustments

**Solution:**
```javascript
// Clear session manually
localStorage.removeItem('ai_trainer_chat_session_demo-user-001');
```

### Session History Loss

**Prevention:**
- Session reset preserves message history
- Only session metadata is reset
- History stored separately in localStorage

## Future Enhancements

### Planned Features
1. **Configurable timeout per user** - Different timeouts for different user types
2. **Session analytics** - Track session patterns and usage
3. **Smart reset warnings** - Notify users before auto-reset
4. **Cross-device session sync** - Maintain sessions across devices

### Advanced Options
1. **Idle detection** - Reset based on actual user activity, not just time
2. **Progressive timeouts** - Different timeouts for different inactivity periods
3. **Session recovery** - Restore previous session state after extended absence
4. **Activity heuristics** - Consider message frequency for timeout calculation

## Monitoring

### Console Logs
- Session initialization: Load vs create
- Reset events: Inactivity duration and threshold
- Activity updates: Message timestamps
- Storage operations: Save/load success/failure

### Metrics to Track
- Average session duration
- Reset frequency
- User return patterns after inactivity
- Message frequency per session

This session management system ensures users have a seamless chat experience while maintaining accurate session timing and preventing the accumulation of unreasonably long session durations. 