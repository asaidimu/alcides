FROM archlinux:latest

COPY release.sh release.sh

RUN yes | pacman -Syyu
RUN yes | pacman -S git nodejs yarn github-cli

ENTRYPOINT ["/release.sh"]
