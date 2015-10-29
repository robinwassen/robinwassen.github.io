---
layout: post
title:  "Datastore migrations in App Engine with golang"
date:   2015-04-21
---

<p class="intro"><span class="dropcap">T</span>there are not many complete examples and resources on how to perform larger migrations on App Engine using go. This blog post will explain on how to successfully perform a migration on a large dataset using the the <a target="_blank" href="https://cloud.google.com/appengine/docs/go/taskqueue/reference">taskqueue package</a>.</p>

### Use PropertyLoadSaver if possible

[PropertyLoadSaver][property-load-saver-reference] is a great tool for seamless data migrations and should be used when it is possible. Rethink your data structure change twice before deciding to not use a PropertyLoadSaver to migrate the data in a production system.

### Few problems when trying to migrate in a naive way 
* Datastore timeouts will happen
* Instance shutdowns during the migration will happen
* You will be crippled by limitations in memory
* Cursor timeouts

### Requirements
* The migration need to be resumable and retryable in all states
* The migration need to be splitted up in smaller batches
* The batches need to be able to run in parallel

### Don't
* Try to take a shortcut by using the delay package

## My approach

I will show a concrete example of my approach, the actual migration done in my approach is trivial and should normally by done using a PropertyLoadSaver. But it is a proof of concept.

### Three step migration
1. Start
2. Enqueue
3. Execute

### 1. Start

The start step is simply to add the "enqueue step" to the task queue.

{% highlight go %}
func Migration_User_Start(w http.ResponseWriter, r *http.Request, c appengine.Context) error {
	t := taskqueue.NewPOSTTask("/task/migration/user/enqueue", nil)
	if _, err := taskqueue.Add(c, t, "migration"); err != nil {
		return err
	}

	return nil
}
{% endhighlight %}

### 2. Enqueue

The Enqueue step is where we take all the items and create one task for each of them.

{% highlight go %}
func Migration_User_Enqueue(w http.ResponseWriter, r *http.Request, c appengine.Context) error {
	t := taskqueue.NewPOSTTask("/task/migration/user/add", nil)
	if _, err := taskqueue.Add(c, t, "migration"); err != nil {
		return err
	}

	return nil
}
{% endhighlight %}

### 3. Execute

{% highlight go %}
package migration

func myFunc() string {
	return "Hello"
}

{% endhighlight %}

### QA

#### Why not use the delay package?

The delay package is well suited for tasks that will execute almost immediately. This because the function that the delay package will execute is temporarily stored in the memory, if the delay between adding a task with the delay package and the actual execution of the task is too big the function stored in the memory seems to be removed.

Better then to have a reliable request handler task.

#### Is it possible to prevent instance shutdowns?

As far as I have seen this is not possible, and I've tried with probably all configurations using manual scaling etc. In any case it's not that important since we need to build things so they can fail.

### Further reading
* [taskqueue package reference][taskqueue-package]

[taskqueue-package]: https://cloud.google.com/appengine/docs/go/taskqueue/reference
[property-load-saver-reference]: https://cloud.google.com/appengine/docs/go/datastore/reference#hdr-The_PropertyLoadSaver_Interface

