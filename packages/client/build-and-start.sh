FILE=build/index.html

if [ -f "$FILE" ]; then
 echo 'already builded'
else    
    npm run build
fi

npx serve -s build