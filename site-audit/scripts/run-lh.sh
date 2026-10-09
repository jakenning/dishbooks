#!/bin/zsh
OUT=/Users/jacobkenning/Dishbooks/.claude/worktrees/site-audit-d37833/site-audit/lighthouse
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
export CHROME_PATH="$CHROME"
pages=(
 "home|https://dishbooks.com/"
 "why|https://dishbooks.com/why-dishbooks"
 "pricing|https://dishbooks.com/pricing"
 "feature|https://dishbooks.com/feature/smart-dashboard"
 "wws|https://dishbooks.com/who-we-serve/independent-restaurants"
 "blog|https://dishbooks.com/blog"
 "post|https://dishbooks.com/blog/how-to-read-a-restaurant-pl-line-by-line"
 "contact|https://dishbooks.com/contact"
 "signup|https://app.dishbooks.com/signup"
)
for run in 1 2 3; do
 for p in $pages; do
  name=${p%%|*}; url=${p#*|}
  for form in mobile desktop; do
   f="$OUT/${name}-${form}-r${run}.json"
   [[ -s $f ]] && continue
   extra=()
   [[ $form == desktop ]] && extra=(--preset=desktop)
   npx -y lighthouse@12.8.2 "$url" --quiet --output=json --output-path="$f" --chrome-flags="--headless=new --no-sandbox" $extra >/dev/null 2>>$OUT/errors.log
   echo "$(date +%T) $name $form r$run $?"
  done
 done
done
echo DONE
