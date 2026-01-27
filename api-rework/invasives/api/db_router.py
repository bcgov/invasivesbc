import logging


class InvasivesDBRouter:

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == "auth" and model_name != "user":
            logging.info("blocking unnecessary migration")
            return False
        return None
