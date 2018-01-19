# Certify Design System Documentation

This is the documentation site for certify.sba.gov. If you are looking for the design system codebase, you can find it [here]("https://github.com/USSBA/cds-gem-prototype").

## To Run

```
bundle install
bundle exec jekyll s
```

## To Deploy
```
bundle exec jekyll build
git add -A
git commit -m "Build for delpoy"
git subtree push --prefix _site origin gh-pages
```
