#!/bin/bash

echo "Setting up ItemSeek Backend environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    
    # Try to detect PostgreSQL user
    if command -v psql &> /dev/null; then
        DB_USER=$(whoami)
        echo "Detected PostgreSQL user: $DB_USER"
        
        # Update DATABASE_URL in .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|postgresql://user:password@localhost:5432/itemseek|postgresql://$DB_USER@localhost:5432/itemseek|" .env
        else
            # Linux
            sed -i "s|postgresql://user:password@localhost:5432/itemseek|postgresql://$DB_USER@localhost:5432/itemseek|" .env
        fi
        
        echo "Updated DATABASE_URL in .env"
    else
        echo "PostgreSQL not found. Please update DATABASE_URL in .env manually."
    fi
else
    echo ".env file already exists"
fi

echo ""
echo "Next steps:"
echo "1. Review .env file and update DATABASE_URL if needed"
echo "2. npm run db:push"
echo "3. npm run db:seed"
echo "4. npm run dev"