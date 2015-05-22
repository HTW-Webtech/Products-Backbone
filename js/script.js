var Product = Backbone.Model.extend({
   initialize: function() {
      var timestamp = this.get('timestamp');
      if (timestamp) {
         var t = timestamp.split(/[- :]/);
         var d = new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]);
         this.set('updated_at', +d);
      }
      else {
         this.set('timestamp', Math.round(this.get('updated_at') / 1000));
      }
   },
   defaults: {
      updated_at: Date.now(),
      id: 0,
      name: '',
      url: '',
      image: '',
      price: ''
   }
});

var Products = Backbone.Collection.extend({
   model: Product,
   url: 'api/index.php',
   initialize: function() {
      this.fetch();
   },
   cheaperThan: function(price) {
      return this.filter(function(product) {
         return +product.get('price') < price;
      });
   }
});


var FormView = Backbone.View.extend({

   el: '.products-form',

   updateClass: 'is-updating',

   model: null,

   events: {
      'click .btn-create': 'create',
      'click .btn-update': 'update',
      'submit': 'stopSubmit'
   },

   render: function() {
      var that = this;
      _.each(this.model.attributes, function(value, key) {
         that.$el.find('input[name="' + key + '"]').val(value);
      });
   },

   setUpdate: function(model) {
      this.model = model;
      this.render();
      this.$el.addClass(this.updateClass);
   },

   create: function(e) {
      App.products.create(this.getValues());
   },

   update: function(e) {
      this.model.save(this.getValues());
   },

   getValues: function() {
      var data = {};
      this.$el.find('input').each(function() {
         data[this.name] = this.value;
      });
      return data;
   },

   stopSubmit: function(event) {
      event.preventDefault();
      this.$el
         .removeClass(this.updateClass)
         .find('input').val('');
   }
});


ProductsView = Backbone.View.extend({

   el: '.products-list',

   initialize: function() {
      _.bindAll(this, 'render', 'appendItem');
      this.collection = App.products;
      this.collection.bind('add', this.appendItem);
   },

   render: function() {
      _.each(this.collection.models, this.appendItem);
   },

   appendItem: function(item) {
      var productView = new ProductView({
         model: item
      });
      this.$el.append(productView.render().el);
   }
});


ProductView = Backbone.View.extend({

   tagName: 'div',

   className: 'item col-xs-4',

   template: _.template($('.products-template').val()),

   events: {
      'click .btn-edit': 'edit',
      'click .btn-delete': 'delete'
   },

   initialize: function() {
      _.bindAll(this, 'render', 'edit', 'delete');
      this.model.bind('change', this.render);
   },

   render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
   },

   edit: function(event) {
      App.formView.setUpdate(this.model);
   },

   delete: function(event) {
      var that = this;
      this.model.destroy({
         success: function(model, response) {
            that.remove();
         }
      });
   }
});

var App = {};
App.products = new Products();
App.formView = new FormView();
App.productsView = new ProductsView();