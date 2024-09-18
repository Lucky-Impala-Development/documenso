#!/bin/bash
openssl genrsa -out private.key 2048
openssl req -new -x509 -key private.key -out certificate.crt -days 365
openssl pkcs12 -export -out cert2.p12 -inkey private.key -in certificate.crt -legacy
