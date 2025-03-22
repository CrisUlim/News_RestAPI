
## Project Structure

```
News_Restapi/
├── backend/               # Django backend
│   ├── news_api/         # Main application
│   ├── news_project/     # Project configuration
│   ├── Dockerfile        # Backend container setup
│   └── requirements.txt  # Python dependencies
├── frontend/             # Vue.js frontend
│   ├── src/              # Source code
│   │   ├── components/   # Vue components
│   │   ├── views/        # Page views
│   │   ├── router/       # Routing
│   │   └── store/        # Vuex state management
│   ├── public/           # Static files
│   ├── Dockerfile        # Frontend container setup
│   └── package.json      # NPM dependencies
├── docker-compose.yml    # Services configuration
└── README.md             # Project documentation
```

## Setup and Installation

### Prerequisites
- Docker and Docker Compose
- Git

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/News_Restapi.git
   cd News_Restapi
   ```

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8000/api/
   - Admin panel: http://localhost:8000/admin/

4. Create a superuser (if needed):
   ```bash
   docker exec -it news_restapi-backend-1 python manage.py createsuperuser
   ```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/articles/` | GET | List all articles |
| `/api/articles/` | POST | Create a new article |
| `/api/articles/:slug/` | GET | Retrieve article details |
| `/api/articles/:slug/` | PUT | Update an article |
| `/api/articles/:slug/` | DELETE | Delete an article |
| `/api/categories/` | GET | List all categories |
| `/api/categories/` | POST | Create a new category |
| `/auth/jwt/create/` | POST | Obtain JWT token |
| `/auth/users/` | POST | Register a new user |
| `/auth/users/me/` | GET | Get current user information |

## Development

### Backend Development

```bash
# Enter backend container
docker exec -it news_restapi-backend-1 bash

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Run tests
python manage.py test
```

### Frontend Development

```bash
# Enter frontend container
docker exec -it news_restapi-frontend-1 bash

# Install dependencies
npm install

# Run development server
npm run serve

# Build for production
npm run build
```

