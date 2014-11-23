Comments = new Mongo.Collection('comments');

Meteor.methods({
  commentInsert: function(commentAttributes) {
    check(this.userId, String); check(commentAttributes, {
      drinkId: String,
      body: String
    });

    var user = Meteor.user();
    var drink = Drinks.findOne(commentAttributes.drinkId);

    if (!drink)
      throw new Meteor.Error('invalid-comment', 'You must comment on a drink');

    comment = _.extend(commentAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    //update drink with the number of comments
    Drinks.update(comment.drinkId, {$inc: {commentsCount: 1}});

    // create the comment, save the id
    comment._id = Comments.insert(comment);

    // now create a notification, informing the user that there's been a comment
    createCommentNotification(comment);

    return comment._id;
  }
});
