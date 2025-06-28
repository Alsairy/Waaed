#!/bin/bash

# Fix trailing spaces and line length issues in YAML files
for file in .github/workflows/*.yml; do
    echo "Fixing $file..."
    
    # Remove trailing spaces
    sed -i 's/[[:space:]]*$//' "$file"
    
    # Add document start marker if missing
    if ! head -1 "$file" | grep -q "^---"; then
        sed -i '1i---' "$file"
    fi
    
    echo "Fixed $file"
done

echo "YAML formatting fixes completed"
