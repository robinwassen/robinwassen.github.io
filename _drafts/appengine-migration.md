# Running datastore migration on App Engine with golang

If possible, use PropertySaveLoader, otherwise split up migration in Tasks.

Few problems
- Datastore timeouts happen - 60 seconds seems to be the new limit
- Instances will get shutdown and resumed when running long tasks, even manual scaling
- Memory restrictions, 1GB is often not enough memory when migrating
- Cursor timeout

Requirements
- Resumable (both adding and processing)
- Small batches

Don't
- Use delay package (the task will get old and disappear)