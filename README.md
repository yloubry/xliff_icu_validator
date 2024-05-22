# Usage
Tested with Node 19
```
npm ci 
node validator.js {PATH_TO_XLIFF_FOLDER}
```

Example of output

```
Processing ../validator/Studio_tasks 2.xlf
Processing ../validator/Studio_tasks 3.xlf
Processing ../validator/Studio_tasks 4.xlf
Processing ../validator/Studio_tasks.xlf
Processing ../validator/Studio_tasks.xliff
Error validating stringID 0000000062 for the language ms-MY
ID: 0000000062
source: {hitung, plural, one {Tampilkan halaman} other {Tampilkan halaman}}
target: {hitung, jamak, satu {Tampilkan halaman} lainnya {Tampilkan halaman}}
Plural or Select argument found in source but is missing in target

Error validating stringID 0000000073 for the language ms-MY
ID: 0000000073
Source: A4 Portrait
Target: 
Source is not empty but target is empty

Error validating stringID 0000000084 for the language ms-MY
ID: 0000000084
source: A4 {Landscape}
target: Landskap
Variable [{Landscape}] missing in target

Some error occured, see logs
```