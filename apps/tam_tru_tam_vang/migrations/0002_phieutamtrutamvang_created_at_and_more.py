# Generated migration for adding created_at and updated_at fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tam_tru_tam_vang', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='phieutamtrutamvang',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='phieutamtrutamvang',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
    ]
