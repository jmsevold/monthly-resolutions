Resolutions = new Mongo.Collection('resolutions');

if (Meteor.isClient) {
  Meteor.subscribe('resolutions');

  Template.body.helpers({
    resolutions: function() {
      if (Session.get('hideFinished')) {
        return Resolutions.find({checked: {$ne: true}});
      } else{
        return Resolutions.find();
      }
    },

    hideFinished: function() {
      return Session.get('hideFinished');
    }
  });


  Template.body.events({
    'submit .new-resolution': function(event) {
      
      event.preventDefault();
      
      var title = event.target.title.value;
      
      Meteor.call('addResolution',title);

      event.target.title.value = '';
    },

    'change .hide-finished': function(event) {
      Session.set('hideFinished',event.target.checked);
    }
  });

  Template.resolution.events({
    'click .delete': function() {
      var id = this._id;
      Meteor.call('removeResolution',id);
    },

    'click .toggle-checked': function() {
      var id = this._id;
      var checked= this.checked;
      Meteor.call('updateResolution',id,checked);
    },

    'click .toggle-private': function() {
      var id     = this._id;
      var access = this.private;
      Meteor.call('togglePrivate',id,access);
    }
  });

   Template.resolution.helpers({
    isOwner: function() {
      return this.owner === Meteor.userId();
    }
  });

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish('resolutions',function() {
    return Resolutions.find({
      $or: [
        {private: {$ne: true} },
        {owner: this.userId}
      ]
    });
  });
}

Meteor.methods({
  addResolution: function(title) {
    Resolutions.insert({
      title: title, 
      createdAt: new Date(),
      owner: Meteor.userId()
    });
  },
  removeResolution: function(id) {
    var res = Resolutions.findOne(id);
    if (res.owner == Meteor.userId()){
      Resolutions.remove(id);
    }else{
      throw new Meteor.error('not-authorized');
    }
    
  },
  updateResolution: function(id,checked) {
    var res = Resolutions.findOne(id);
    if (res.owner == Meteor.userId()){
      Resolutions.update(id,{$set: {checked: !checked}});
    }else{
      throw new Meteor.error('not-authorized');
    }
    
  },
  togglePrivate: function(id,access) {
    var res = Resolutions.findOne(id);

    if (res.owner == Meteor.userId()) {
      Resolutions.update(id,{$set: {private: !access}});
    }else{
      throw new Meteor.error('not-authorized');
    }
  }
});
