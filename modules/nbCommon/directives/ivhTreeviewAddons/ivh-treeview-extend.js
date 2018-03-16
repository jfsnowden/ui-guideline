
angular.module('ivh.treeview').directive('ivhTreeviewNodeExtend', ['ivhTreeviewCompiler', 'ivhTreeviewOptions', function(ivhTreeviewCompiler, ivhTreeviewOptions) {
  'use strict';
  return {
    restrict: 'A',
    scope: {
      node: '=ivhTreeviewNodeExtend',
      depth: '=ivhTreeviewDepth',
      showNodeNum: '='
    },
    require: '^ivhTreeviewExtend',
    compile: function(tElement) {
      var selectTimeout = null;
      return ivhTreeviewCompiler
        .compile(tElement, function(scope, element, attrs, trvw) {
          /*
            more的分页说明，YangYL
            pageNum记录当前需要显示的页数
            totalRecord记录当前节点分页后的总页数 分页是根据传进来的showNodeNum分页
            pageNumObj用于记录目前已经显示的哪些页用object快速查询不用每次都遍历pageNum
            lastPageNum最后一页存在多少条数据
          */
          var node = scope.node,
              pageNum = [1],
              pageNumObj = {'a1':1},
              totalRecord = 0,
              lastPageNum = 0;

          var getChildren = scope.getChildren = function(page) {

            if ( selectTimeout != null ) {
              clearTimeout(selectTimeout);
            }
            var _node = trvw.children(node);
            /*window.SELECTNODE为空的时候表示搜索前的状态，判断相等是为了知道当前是否属于这个节点*/
            if ( _node[0] && window.SELECTNODE && 
                (_node[0].parentIds.join(',') == window.SELECTNODE.parentIds.join(','))
              ) {
              var searchNodePage = Math.ceil((window.SELECTNODE._nodeIndex + 1) / scope.showNodeNum);
              if ( pageNumObj['a'+searchNodePage] != 1 ) {
                pageNum.push(searchNodePage);
                pageNumObj['a'+searchNodePage] = 1;
              }
            }
            
            if (_node.length > 0 ) {
              totalRecord = Math.ceil(_node.length / scope.showNodeNum);
              lastPageNum = _node.length - (totalRecord - 1) * scope.showNodeNum;
              _node = _node.slice(scope.showNodeNum * (page - 1), scope.showNodeNum * page);
            }
            //使用完后清除SELECTNODE避免污染别的tree
            selectTimeout = setTimeout(function() {
              window.SELECTNODE = null;
            },30000);
            
            return _node;
          };

          scope.trvw = trvw;
          scope.childDepth = scope.depth + 1;

          trvw.expand(node, trvw.isInitiallyExpanded(scope.depth));

          scope.isShowMore = function(page) {
            page += 1;
            if ( pageNumObj['a'+page] == 1 || page > totalRecord ) {
              return false;
            }
            else {
              return true;
            }
          }
          
          scope.more = function(page) {
            page += 1;
            pageNum.push(page);
            pageNumObj['a'+page] = 1;
            pageNum.sort(function (x,y) {
                return x-y;
            });
          }
          scope.getPage = function() {
            return pageNum;
          }
          //获取之前未展开的节点数
          scope.getMoreNum = function(page) {
            var i = 0;
            while(page < totalRecord) {
              page++;
              if ( pageNumObj['a'+page] == 1 ) {
                break;
              }
              i++;
            }
            i *= scope.showNodeNum;
            if ( page == totalRecord ) {
              i = i - scope.showNodeNum + lastPageNum;
            }
            return i;
          }
          /*var watcher = scope.$watch(function() {
            return getChildren().length > 0;
          }, function(newVal) {
            console.log(newVal);
            if(newVal) {
              element.removeClass('ivh-treeview-node-leaf');
            } else {
              element.addClass('ivh-treeview-node-leaf');
            }
          });*/
        });
    },
    template: ivhTreeviewOptions().nodeTpl
  };
}]);
angular.module('ivh.treeview').directive('ivhTreeviewChildrenExtend', function() {
  'use strict';
  return {
    restrict: 'AE',
    template: [
      '<ul ng-repeat="page in getPage();" ng-if="getChildren(page).length" class="ivh-treeview">',
        '<li ng-repeat="child in getChildren(page)"',
            'ng-hide="trvw.hasFilter() && !trvw.isVisible(child)"',
            'ng-class="{\'ivh-treeview-node-collapsed\': !trvw.isExpanded(child) && !trvw.isLeaf(child)}"',
            'ivh-treeview-node-extend="child"',
            'ivh-treeview-depth="childDepth">',
        '</li>',
        '<li ng-if="isShowMore(page)">',
          '<a ng-click="more(page)" style="margin-left:15px;text-decoration:none;" href="javascript:;">---- More({{getMoreNum(page)}}) ----</a>',
        '</li>',
      '</ul>'
    ].join('\n')
  };
});
angular.module('ivh.treeview').directive('ivhTreeviewExtend', ['ivhTreeviewMgr', function(ivhTreeviewMgr) {
  'use strict';
  return {
    restrict: 'A',
    transclude: true,
    scope: {
      // The tree data store
      root: '=ivhTreeviewExtend',

      // Specific config options
      childrenAttribute: '=ivhTreeviewChildrenAttribute',
      clickHandler: '=ivhTreeviewClickHandler',
      changeHandler: '=ivhTreeviewChangeHandler',
      defaultSelectedState: '=ivhTreeviewDefaultSelectedState',
      expandToDepth: '=ivhTreeviewExpandToDepth',
      idAttribute: '=ivhTreeviewIdAttribute',
      indeterminateAttribute: '=ivhTreeviewIndeterminateAttribute',
      expandedAttribute: '=ivhTreeviewExpandedAttribute',
      labelAttribute: '=ivhTreeviewLabelAttribute',
      nodeTpl: '=ivhTreeviewNodeTpl',
      selectedAttribute: '=ivhTreeviewSelectedAttribute',
      twistieCollapsedTpl: '=ivhTreeviewTwistieCollapsedTpl',
      twistieExpandedTpl: '=ivhTreeviewTwistieExpandedTpl',
      twistieLeafTpl: '=ivhTreeviewTwistieLeafTpl',
      useCheckboxes: '=ivhTreeviewUseCheckboxes',
      validate: '=ivhTreeviewValidate',
      visibleAttribute: '=ivhTreeviewVisibleAttribute',

      // Generic options object
      userOptions: '=ivhTreeviewOptions',

      // The filter
      filter: '=ivhTreeviewFilter'
    },
    controllerAs: 'trvw',
    controller: ['$scope', '$element', '$attrs', '$transclude', 'ivhTreeviewOptions', 'filterFilter', function($scope, $element, $attrs, $transclude, ivhTreeviewOptions, filterFilter) {
      var ng = angular
        , trvw = this;

      // Merge any locally set options with those registered with hte
      // ivhTreeviewOptions provider
      var localOpts = ng.extend({}, ivhTreeviewOptions(), $scope.userOptions);

      ng.forEach([
        'childrenAttribute',
        'defaultSelectedState',
        'expandToDepth',
        'idAttribute',
        'indeterminateAttribute',
        'expandedAttribute',
        'labelAttribute',
        'nodeTpl',
        'selectedAttribute',
        'twistieCollapsedTpl',
        'twistieExpandedTpl',
        'twistieLeafTpl',
        'useCheckboxes',
        'validate',
        'visibleAttribute'
      ], function(attr) {
        if(ng.isDefined($scope[attr])) {
          localOpts[attr] = $scope[attr];
        }
      });

      // Treat the transcluded content (if there is any) as our node template
      var transcludedScope;
      $transclude(function(clone, scope) {
        var transcludedNodeTpl = '';
        angular.forEach(clone, function(c) {
          transcludedNodeTpl += (c.innerHTML || '').trim();
        });
        if(transcludedNodeTpl.length) {
          transcludedScope = scope;
          localOpts.nodeTpl = transcludedNodeTpl;
        }
      });

      /**
       * Get the merged global and local options
       *
       * @return {Object} the merged options
       */
      trvw.opts = function() {
        return localOpts;
      };

      // If we didn't provide twistie templates we'll be doing a fair bit of
      // extra checks for no reason. Let's just inform down stream directives
      // whether or not they need to worry about twistie non-global templates.
      var userOpts = $scope.userOptions || {};

      /**
       * Whether or not we have local twistie templates
       *
       * @private
       */
      trvw.hasLocalTwistieTpls = !!(
        userOpts.twistieCollapsedTpl ||
        userOpts.twistieExpandedTpl ||
        userOpts.twistieLeafTpl ||
        $scope.twistieCollapsedTpl ||
        $scope.twistieExpandedTpl ||
        $scope.twistieLeafTpl);

      /**
       * Get the child nodes for `node`
       *
       * Abstracts away the need to know the actual label attribute in
       * templates.
       *
       * @param {Object} node a tree node
       * @return {Array} the child nodes
       */
      trvw.children = function(node) {
        var children = node[localOpts.childrenAttribute];
        return ng.isArray(children) ? children : [];
      };

      /**
       * Get the label for `node`
       *
       * Abstracts away the need to know the actual label attribute in
       * templates.
       *
       * @param {Object} node A tree node
       * @return {String} The node label
       */
      trvw.label = function(node) {
        return node[localOpts.labelAttribute];
      };

      /**
       * Returns `true` if this treeview has a filter
       *
       * @return {Boolean} Whether on not we have a filter
       * @private
       */
      trvw.hasFilter = function() {
        return ng.isDefined($scope.filter);
      };

      /**
       * Get the treeview filter
       *
       * @return {String} The filter string
       * @private
       */
      trvw.getFilter = function() {
        return $scope.filter || '';
      };

      /**
       * Get the tree node template
       *
       * @return {String} The node template
       * @private
       */
      trvw.getNodeTpl = function() {
        return localOpts.nodeTpl;
      };

      /**
       * Returns `true` if current filter should hide `node`, false otherwise
       *
       * @param {Object} node A tree node
       * @return {Boolean} Whether or not `node` is filtered out
       */
      trvw.isVisible = function(node) {
        var filter = trvw.getFilter();
        if(!filter) {
          return true;
        }
        return !!filterFilter([node], filter).length;
      };

      /**
       * Returns `true` if we should use checkboxes, false otherwise
       *
       * @return {Boolean} Whether or not to use checkboxes
       */
      trvw.useCheckboxes = function() {
        return localOpts.useCheckboxes;
      };

      /**
       * Select or deselect `node`
       *
       * Updates parent and child nodes appropriately, `isSelected` defaults to
       * `true`.
       *
       * @param {Object} node The node to select or deselect
       * @param {Boolean} isSelected Defaults to `true`
       */
      trvw.select = function(node, isSelected) {
        ivhTreeviewMgr.select($scope.root, node, localOpts, isSelected);
        trvw.onNodeChange(node, isSelected);
      };

      /**
       * Get the selected state of `node`
       *
       * @param {Object} node The node to get the selected state of
       * @return {Boolean} `true` if `node` is selected
       */
      trvw.isSelected = function(node) {
        return node[localOpts.selectedAttribute];
      };

      /**
       * Toggle the selected state of `node`
       *
       * Updates parent and child node selected states appropriately.
       *
       * @param {Object} node The node to update
       */
      trvw.toggleSelected = function(node) {
        var isSelected = !node[localOpts.selectedAttribute];
        trvw.select(node, isSelected);
      };

      /**
       * Expand or collapse a given node
       *
       * `isExpanded` is optional and defaults to `true`.
       *
       * @param {Object} node The node to expand/collapse
       * @param {Boolean} isExpanded Whether to expand (`true`) or collapse
       */
      trvw.expand = function(node, isExpanded) {
        ivhTreeviewMgr.expand($scope.root, node, localOpts, isExpanded);
      };

      /**
       * Get the expanded state of a given node
       *
       * @param {Object} node The node to check the expanded state of
       * @return {Boolean}
       */
      trvw.isExpanded = function(node) {
        return node[localOpts.expandedAttribute];
      };

      /**
       * Toggle the expanded state of a given node
       *
       * @param {Object} node The node to toggle
       */
      trvw.toggleExpanded = function(node) {
        //node.expanded = (node.expanded)?false:true;
        trvw.expand(node, !trvw.isExpanded(node));
      };

      /**
       * Whether or not nodes at `depth` should be expanded by default
       *
       * Use -1 to fully expand the tree by default.
       *
       * @param {Integer} depth The depth to expand to
       * @return {Boolean} Whether or not nodes at `depth` should be expanded
       * @private
       */
      trvw.isInitiallyExpanded = function(depth) {
        var expandTo = localOpts.expandToDepth === -1 ?
          Infinity : localOpts.expandToDepth;
        return depth < expandTo;
      };

      /**
       * Returns `true` if `node` is a leaf node
       *
       * @param {Object} node The node to check
       * @return {Boolean} `true` if `node` is a leaf
       */
      trvw.isLeaf = function(node) {
        return trvw.children(node).length === 0;
      };

      /**
       * Get the template to be used for tree nodes
       *
       * @return {String} The template
       * @private
       */
      trvw.getNodeTpl = function() {
        return localOpts.nodeTpl;
      };

      /**
       * Call the registered node click handler
       *
       * Handler will get a reference to `node` and the root of the tree.
       *
       * @param {Object} node Tree node to pass to the handler
       * @private
       */
      trvw.onNodeClick = function(node) {
        ($scope.clickHandler || angular.noop)(node, $scope.root);
      };

      /**
       * Call the registered selection change handler
       *
       * Handler will get a reference to `node`, the new selected state of
       * `node, and the root of the tree.
       *
       * @param {Object} node Tree node to pass to the handler
       * @param {Boolean} isSelected Selected state for `node`
       * @private
       */
      trvw.onNodeChange = function(node, isSelected) {
        ($scope.changeHandler || angular.noop)(node, isSelected, $scope.root);
      };

      var pageNum = [1],
          pageNumObj = {'a1':1},
          totalRecord = 0,
          lastPageNum = 0;

      var getChildren = $scope.getChildren = function(page) {
        var _node = $scope.root;

        if (_node.length > 0 ) {
          totalRecord = Math.ceil(_node.length / localOpts.showNodeNum);
          lastPageNum = _node.length - (totalRecord - 1) * localOpts.showNodeNum;
          _node = _node.slice(localOpts.showNodeNum * (page - 1), localOpts.showNodeNum * page);
        }
        return _node;
      };

      $scope.isShowMore = function(page) {
        page += 1;
        if ( pageNumObj['a'+page] == 1 || page > totalRecord ) {
          return false;
        }
        else {
          return true;
        }
      }

      $scope.getPage = function() {
        return pageNum;
      }

      //获取之前未展开的节点数
      $scope.getMoreNum = function(page) {
        var i = 0;
        while(page < totalRecord) {
          page++;
          if ( pageNumObj['a'+page] == 1 ) {
            break;
          }
          i++;
        }
        i *= localOpts.showNodeNum;
        if ( page == totalRecord ) {
          i = i - localOpts.showNodeNum + lastPageNum;
        }
        return i;
      }

      $scope.more = function(page) {
        page += 1;
        pageNum.push(page);
        pageNumObj['a'+page] = 1;
        pageNum.sort(function (x,y) {
            return x-y;
        });
      }
    }],
    link: function(scope, element, attrs) {
      var opts = scope.trvw.opts();

      // Allow opt-in validate on startup
      if(opts.validate) {
        ivhTreeviewMgr.validate(scope.root, opts);
      }
    },
    template: [
      '<ul ng-repeat="page in getPage();" class="ivh-treeview">',
        '<li ng-repeat="child in getChildren(page) | ivhTreeviewAsArray"',
            'ng-hide="trvw.hasFilter() && !trvw.isVisible(child)"',
            'ng-class="{\'ivh-treeview-node-collapsed\': !trvw.isExpanded(child) && !trvw.isLeaf(child)}"',
            'ivh-treeview-node-extend="child"',
            'ivh-treeview-depth="0">',
        '</li>',
        '<li ng-if="isShowMore(page)">',
          '<a ng-click="more(page)" style="margin-left:15px;text-decoration:none;" href="javascript:;">---- More({{getMoreNum(page)}}) ----</a>',
        '</li>',
      '</ul>'
    ].join('\n')
  };
}]);