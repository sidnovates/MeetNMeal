# MeetNMeal Backend

Backend service for the MeetNMeal group dining recommendation system.
    
## ⏳ Group Lifecycle Management

To ensure scalability and bounded memory usage, we implement an automatic cleanup strategy:

**Server starts**  
   ↓  
**Groups created with expiry timestamps** (TTL: 30 minutes)  
   ↓  
**Background cleanup loop runs every minute** (Asyncio Task)  
   ↓  
**Expired groups are removed from memory**  
   ↓  
**Memory stays bounded**

## API Validation & Robustness

We have implemented several validation checks to ensure smooth group coordination:

## 🛡️ Robust API Validation & Security

Our system is engineered with a **fail-safe validation layer** to ensure seamless group coordination and data integrity. We handle edge cases proactively:

### 🔒 Integrity Checks
*   **Double-Submission Prevention**: Implements strict state-locking to prevent users from submitting preferences multiple times, ensuring data consistency (`400 Bad Request`).
*   **Compute Guard**: The recommendation engine is **locked** until every single participant signals readiness (`ready: true`). This prevents premature or incomplete algorithm execution.
*   **Fetch Guard**: Prevents race conditions by blocking result retrieval attempts until the computation phase is fully complete (`404 Not Found` if accessed early).

### 🚦 Flow Control
*   **Post-Compute Lock**: Automatically seals the group once results are generated, preventing new users from joining and disrupting the established consensus.
*   **Zero-State Handling**: Intelligently detects and blocks operations on empty groups, ensuring resources are never wasted on invalid states.

## 🚀 Redis Session Management

We have introduced a Redis-based session storage option (`api/session_redis.py`) which is superior to the in-memory store (`api/session_store.py`) as it persists data and handles TTL automatically.

### Switching Implementations
To switch between the in-memory store and Redis, you only need to modify **`api/routes.py`**:
*   **Use Redis**: Comment out imports from `session_store` and uncomment imports from `session_redis`.
*   **Use In-Memory**: Do the reverse.

### Redis Setup (Linux/WSL)
1.  **Start the Server**:
    ```bash
    redis-server
    ```
2.  **Inspect Data**:
    Open a new terminal and run:
    ```bash
    redis-cli
    ```
    *   **List Groups**: `keys *` (Returns active group IDs)
    *   **Inspect Group**: `get <group_id>` (Shows participants, preferences, and results in JSON format)

