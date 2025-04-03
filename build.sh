#!/bin/bash

export PATH=/bin:/usr/bin:/usr/local/bin

if [[ -d /u01/www/audiforlife.com.old ]]; then
    rm -r /u01/www/audiforlife.com.old
fi

mv /u01/www/audiforlife.com /u01/www/audiforlife.com.old

npx @11ty/eleventy
mv _site /u01/www/audiforlife.com
