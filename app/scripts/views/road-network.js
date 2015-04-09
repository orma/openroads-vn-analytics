/*global OpenroadsAnalytics, Backbone, JST*/

OpenroadsAnalytics.Views = OpenroadsAnalytics.Views || {};

(function () {
    'use strict';

    OpenroadsAnalytics.Views.RoadNetwork = Backbone.View.extend({

        template: JST['app/scripts/templates/road-network.ejs'],

        tagName: 'div',

        id: '',

        className: '',

        events: {},

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
        }

    });

})();
