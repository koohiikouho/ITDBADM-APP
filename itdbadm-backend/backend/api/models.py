from django.db import models

from django.contrib.auth.models import AbstractUser


# Create your models here.

class CustomUser(AbstractUser):
    role_id = models.IntegerField(null=True, blank=True)
    genre = models.CharField(max_length=50, null=True, blank=True)
    currency_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.username
