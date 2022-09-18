FROM paritytech/ci-linux:1c0fde6a-20220811
EXPOSE 9944
WORKDIR /var/www/node-template
ENV CARGO_HOME=/var/www/node-template/.cargo
COPY binaries /var/www/node-template
CMD ["bash"]