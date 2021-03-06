# Generated by Django 4.0.4 on 2022-05-02 21:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="twitteruser",
            name="last_scraped_at",
            field=models.DateTimeField(null=True),
        ),
        migrations.AlterField(
            model_name="image",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name="image",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name="twitteruser",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name="twitteruser",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
    ]
