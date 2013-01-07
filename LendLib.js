var lists = new Meteor.Collection("Lists");

if (Meteor.isClient) {
  // Template.hello.greeting = function () {
  //   return "my list.";
  // };

  // Template.hello.events({
  //   'click input' : function () {
  //     // template data, if any, is available in 'this'
  //     if (typeof console !== 'undefined')
  //       console.log("You pressed the button");
  //   }
  // });

  // generic helper functions
  function focusText(i, val) {
    i.focus();
    i.value = val ? val : "";
    i.select();
  };

  function selectCategory(e, t) {
    Session.set('current_list', this._id);
  };

  function addItem(list_id, item_name) {
    if (!list_id && !item_name) {
      return;
    } else {
      lists.update(
        {_id:list_id},
        {$addToSet:{items:{Name:item_name}}}
      );
    };
  };

  function removeItem(list_id, item_name) {
    if (!list_id && !item_name) {
      return;
    } else {
      lists.update(
        {_id:list_id},
        {$pull:{items:{Name:item_name}}}
      );
    };
  };

  function updateLendee(list_id, item_name, lendee_name) {
    var list = lists.findOne({"_id":list_id, "items.Name":item_name});
    if (list && list.items) {
      for (var i = 0; i < list.items.length; i++) {
        if (list.items[i].Name === item_name) {
          list.items[i].LentTo = lendee_name;
        }
      };
      lists.update({"_id":list_id}, {$set:{"items":list.items}});
    };
  };

  Template.categories.lists = function () {
    return lists.find({}, {sort: {Category: 1}});
  };
  // declare adding_category flag
  Session.set('adding_category', false);

  Template.categories.new_cat = function () {
    return Session.equals('adding_category', true);
  };

  Template.categories.events({
    'click #btnNewCat': function (e, t) {
      Session.set('adding_category', true);
      Meteor.flush();
      focusText(t.find("#add-category"));
    },

    'keyup #add-category': function (e, t) {
      if (e.which === 13) {
        var catVal = String(e.target.value || "");
        if (catVal) {
          lists.insert({Category:catVal});
          Session.set('adding_category', false);
        }
      }
    },

    'focusout #add-category': function (e, t) {
      Session.set('adding_category', false);
    },

    'click .category': selectCategory
  });

  Template.list.items = function () {
    if (Session.equals('current_list', null)) {
      return null;
    } else {
      var cat = lists.findOne({_id:Session.get('current_list')});
      if (cat && cat.items) {
        for(var i = 0; i < cat.items.length; i++) {
          var d = cat.items[i];
          d.Lendee = d.LentTo ? d.LentTo : "free";
          d.LendClass = d.LentTo ? "label-important" : "label-success";
        }
        return cat.items;
      }
    }
  };

  Template.list.list_selected = function () {
    return ( (Session.get('current_list') != null) && (!Session.equals('current_list', null)) );
  };

  Template.list.list_adding = function () {
    return (Session.equals('list_adding', true));
  };

  Template.list.lendee_editing = function () {
    return (Session.equals('lendee_input', this.Name));
  };

  Template.categories.list_status = function () {
    if (Session.equals('current_list', this._id)) {
      return "";
    } else {
      return " btn-inverse";
    }
  };

  Template.list.events({
    'click #btnAddItem': function (e, t) {
      Session.set('list_adding', true);
      Meteor.flush();
      focusText(t.find("#item_to_add"));
    },

    'keyup #item_to_add': function (e, t) {
      if (e.which === 13) {
        addItem(Session.get('current_list'), e.target.value);
        Session.set('list_adding', false);
      }
    },

    'focusout #item_to_add': function (e, t) {
      Session.set('list_adding', false);
    },

    'click .delete_item': function (e, t) {
      removeItem(Session.get('current_list'), e.target.id);
    },

    'click .lendee': function (e, t) {
      Session.set('lendee_input', this.Name);
      Meteor.flush();
      focusText(t.find("#edit_lendee"), this.LentTo);
    },

    'keyup #edit_lendee': function (e, t) {
      if (e.which === 13) {
        updateLendee(Session.get('current_list'), this.Name, e.target.value);
        Session.set('lendee_input', null);
      }
      if (e.which === 27) {
        Session.set('lendee_input', null);
      }
    },

    'focusout #edit_lendee': function (e, t) {
      Session.set('lendee_input', null);
    },

  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
