import inspect
from django.contrib import admin
from django.db import models
from invasivesbc.db_models import codes, activity

# Define the modules to process
MODULES_TO_REGISTER = [
    codes,
    activity,
]

def register_models_from_module(module):
    """
    Dynamically registers all Django Model subclasses found in a given module
    with the Django admin site, unless they are abstract.
    """
    app_label = module.__name__.split('.')[-2]  # Assuming the module is inside an app

    print(f"--- Registering models from module: {module.__name__} ---")

    # Iterate through all members (classes, functions, etc.) of the imported module
    for name, obj in inspect.getmembers(module):

        # Check if the member is a class
        if inspect.isclass(obj):

            # Check if the class is a Django Model (subclass of models.Model)
            # and that it hasn't been defined as abstract,
            # and that it belongs to the current app (optional, but good practice)
            # and that it's not the base models.Model class itself
            is_django_model = issubclass(obj, models.Model)
            is_abstract = hasattr(obj, '_meta') and obj._meta.abstract
            is_in_app = obj.__module__.startswith(module.__name__.split('.')[0])
            is_base_model = obj is models.Model

            if is_django_model and not is_abstract and is_in_app and not is_base_model:
                try:
                    admin.site.register(obj)
                    print(f"    ✅ Registered Model: {obj.__name__}")
                except admin.sites.AlreadyRegistered:
                    # In case the model was registered elsewhere, or if the
                    # dynamic import registers the same model twice
                    print(f"    ⚠️ Already Registered: {obj.__name__}")
                except Exception as e:
                    print(f"    ❌ Failed to register {obj.__name__}: {e}")

# Apply the registration function to your modules
for module in MODULES_TO_REGISTER:
    register_models_from_module(module)
