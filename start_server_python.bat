cd ServerPython
python3 manage.py runserver 0.0.0.0:8011
if errorlevel 1 goto Fail

:Fail
python manage.py runserver 0.0.0.0:8011