## setup in GitHub codespaces

```
sudo rm -f /usr/local/bin/hugo
sudo rm -f /usr/local/hugo/bin/hugo
which hugo
wget https://github.com/gohugoio/hugo/releases/download/v0.139.4/hugo_extended_0.139.4_linux-amd64.tar.gz
tar -xvzf hugo_extended_0.139.4_linux-amd64.tar.gz
sudo mv hugo /usr/local/bin/
unset HUGO_BIN

```
restart terminal

## run
```
hugo server -D
```