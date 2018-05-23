if [ ! -d "_site" ] ; then
  git clone git@github.com:USSBA/certify-design-system-documentation.git -b gh-pages _site
fi

rm -rf _site
bundle exec jekyll build
cd _site
touch .nojekyll
git init
git remote add origin git@github.com:USSBA/certify-design-system-documentation.git
git checkout -b gh-pages
git add -A
git commit -m "update site"
git push origin gh-pages
cd ../
rm -rf _site
