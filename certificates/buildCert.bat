ECHO Building certificates for HTTPS
openssl genrsa -out private.key 4096
openssl req -new -sha256 -out private.csr -key private.key -config openssl.conf
openssl x509 -req -days 365 -in private.csr -signkey private.key -out private.crt -extensions v3_ca -extfile openssl.conf
openssl x509 -in private.crt -out private.pem -outform PEM