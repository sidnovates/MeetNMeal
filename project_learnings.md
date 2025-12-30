# Project Learnings & Notes

## Recommendation System Types

1.  **Content-Based Filtering**
    *   Recommends items based on item attributes/content.
    *   *Example:* If a person watches a comedy movie, the system recommends other movies tagged as "comedy" or having similar content.

2.  **Collaborative Filtering**
    *   Recommends items based on the interactions of similar users.
    *   *Example:* If Person 1 and Person 2 both watch Movie A, and their interests intersect, if Person 1 watches Movie B, then Movie B is suggested to Person 2.

3.  **Hybrid Approach**
    *   A combination of Content-Based and Collaborative Filtering techniques to leverage the strengths of both.

## Data Handling with Pandas

Essential commands for data manipulation and analysis:

```python
import pandas as pd

# Load data
movies = pd.read_csv("path/to/file.csv")

# Inspection
movies.shape             # Returns (rows, columns)
movies.head(2)           # View the first two rows

# Merging DataFrames
# Merges 'movies' and 'credits' on the 'id' column
merged = movies.merge(credits, on="id")

# Accessing Data
movies.iloc[i]           # Access the i-th row
movies.iloc[i]["language"] # Access value of 'language' column in i-th row
movies["lang"]           # Access the entire 'lang' column

# Statistics & Cleaning
movies["lang"].value_counts() # Count of unique values in 'lang'
movies.isnull().sum()    # Count total null values in each column
movies.dropna(inplace=True) # Remove missing values
movies.duplicated().sum() # Check for duplicate rows
```

## Data Preprocessing Pipeline

1.  **Data Cleaning:** check for null values and handle duplicates.
2.  **Format Conversion:** If columns contain JSON data (e.g., lists of dictionaries), parse them to extract relevant words/names.
3.  **Tag Generation:**
    *   Join features from multiple columns to form a "tags" column.
    *   Tags should ideally be paragraph-wise.
    *   Combine paragraphs to form a single large composite text (corpus) for each item.

## Natural Language Processing (NLP)

### 1. Vectorization: CountVectorizer vs. TfidfVectorizer

Both methods turn text tags into numeric vectors, but they differ significantly in weighting.

#### CountVectorizer (Bag of Words)
*   **Mechanism:** Simply counts how many times each tag appears.
*   **Example:** "north_indian dum_biryani dum_biryani" → `north_indian: 1`, `dum_biryani: 2`.
*   **Why it is NOT suitable for this system:**
    1.  **Rare Revalidations:** Tags like "pasta" or "north_indian" rarely repeat within the same restaurant's tag list, resulting in a binary (0 or 1) count which offers poor granularity for similarity.
    2.  **Equal Weighting:** It treats common tags (e.g., "north_indian", "chinese") as equally important to rare, specific tags (e.g., "paneer_lajawab", "lunch_buffet").
    3.  **Ignores Rarity:** It fails to give higher importance to unique/rare tags that are highly robust for distinguishing restaurants.

#### TF-IDF (Term Frequency–Inverse Document Frequency)
*   **Mechanism:** Weighs terms based on their frequency in the document *and* their rarity across the entire dataset.
*   **Why it is BETTER:**
    1.  **High Weight for Rare Tags:** "lunch_buffet" (appearing in 1% of restaurants) gets a high score.
    2.  **Low Weight for Common Tags:** "north_indian" (appearing in 60% of restaurants) gets a low score.
    3.  **Captures Multi-Dish Preferences:** Accurately reflects weighted interests (e.g., if a user likes "biryani" + "pasta", it finds restaurants strong in both, not just one).

**Conclusion:** **DO NOT use CountVectorizer for tag-based restaurant systems.** TF-IDF is superior for identifying similar cuisines, dishes, and vibes.

**Implementation Example:**
```python
from sklearn.feature_extraction.text import TfidfVectorizer

# Create TF-IDF vectorizer (specifically for dishes)
dish_vectorizer = TfidfVectorizer()

# Fit and transform
# matrix shape: (records, features)
rest_dish_tfidf_matrix = dish_vectorizer.fit_transform(zomato_unique["dish_string"])

# Converting user input to vector
user_vec = dish_vectorizer.transform([user_input])
```

### 2. Stemming (PorterStemmer)
Reduces words to their root form to avoid treating variations of the same word as different features (e.g., "laugh" and "laughs").

```python
import nltk
from nltk.stem.porter import PorterStemmer
ps = PorterStemmer()
```

### 3. Similarity Calculation (Cosine Similarity)
Determines how similar one vector is to another by calculating the cosine distance between them. Diagonals are always 1.

```python
from sklearn.metrics.pairwise import cosine_similarity
similarity = cosine_similarity(vectors)
```

## Location Scoring & Geolocation

*   **Google Distance Matrix API:**
    *   *Pros:* Extremely accurate, accounts for actual road networks and traffic.
    *   *Cons:* Not free.
*   **Nominatim (OpenStreetMap) + Haversine Formula:**
    *   *Mechanism:* Use Nominatim API to get coordinates (Latitude/Longitude) for addresses. Use the **Haversine Formula** to calculate the straight-line distance (great-circle distance) between two points.
    *   *Usage in Project:* cost-effective solution for recommendation scoring (where exact delivery-time precision isn't critical).

## FastAPI Architecture

### 1. Routes (`routes.py`)
Connects the backend logic to the frontend via API endpoints.
```python
@router.post("/endpoint_url")
async def some_function():
    ...
```

### 2. Schemas & Pydantic (`schemas.py`)
Defines the structure of request and response data (The "JSON Contract").

*   **Why use `response_model`?**
    *   FastAPI communicates via HTTP (JSON), not Python objects.
    *   **Validation:** Ensures the output matches the expected format.
    *   **Serialization:** Converts Python objects/classes to JSON automatically.
    *   **Filtering:** Removes extra or sensitive internal fields not defined in the model.
    *   **Documentation:** Auto-generates Swagger/OpenAPI docs.

```python
@router.post("/group/create", response_model=CreateGroupResponse)
# This validates that the return value matches the 'CreateGroupResponse' class structure.
```

## Redis (Remote Dictionary Server)

In-memory key-value store. Fast but volatile (RAM-based). Often used for **Caching** and session storage.

### Common Commands
*   `SET key value` / `GET key` / `EXISTS key`
*   `KEYS *`: List all keys.
*   `FLUSHALL`: Clear database.
*   **Expiration:**
    *   `TTL key`: Check remaining time to live.
    *   `EXPIRE key 10`: Set expiry to 10 seconds.
    *   `SETEX key 10 value`: Set value with 10s expiry.
*   **Lists:** `LPUSH`, `LRANGE` (0 -1 for all), `LPOP`
*   **Sets:** `SADD`, `SMEMBERS`
*   **Hashes:** `HSET`, `HGET`, `HGETALL`

### Keyspace Notifications
Redis operations are silent. To react to events (like a key expiring), we use **Keyspace Notifications**.
*   Config: `config_set('notify-keyspace-events', 'Ex')` (Enable expiry events).
*   **Pub/Sub Listener:** Since Pub/Sub is blocking, it needs a dedicated client/connection to listen for events in the background without blocking the main application logic.

```python
# Async Listener for Expiration
pubsub = r_listener.pubsub()
await pubsub.psubscribe("__keyevent@0__:expired")
```

## WebSockets & Real-Time Updates

Used to broadcast state changes (like "User A is Ready") to all connected clients immediately without polling.

### Workflow
1.  **Connection:** User joins and opens a WebSocket connection: `ws://.../ws/{group_id}/{user_id}`.
2.  **Storage:** Server stores the active connection in a `ConnectionManager`.
3.  **Submission:** User POSTs preferences via REST API.
4.  **Broadcast:** API saves data -> Calls `manager.broadcast(group_id, message)`.
5.  **Update:** Server iterates through all active sockets for that `group_id` and sends the message. Frontend receives it and updates UI.

### Note on Async/Await
*   `async def`: Defines a function that can be paused (non-blocking).
*   `await`: Pauses execution until the awaited task is done, allowing the event loop to handle other tasks in the meantime.
*   *Rule:* You cannot use `await` inside a standard `def` function; it must be inside `async def`.
