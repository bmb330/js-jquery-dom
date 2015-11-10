$.fn.tabs = function() {
  this.attr("class", "tabs");
  return $.each(this, function(i, element) {
    var active, tabContent = function(li) {
      return $(li.find("a").attr("href"));
    }, activate = function(li) {
      if (active) {
        active.removeClass("active");
        tabContent(active).hide();
      }
      active = li.addClass("active");
      tabContent(li).show();
    }, $lis = $([ element ]).children();
    activate($(element).find("li:first"));
    $.each($lis, function(i, li) {
      if (i === 0) {
        activate($([ li ]));
      } else {
        tabContent($([ li ])).hide();
      }
    });
    $lis.bind("click", function(event) {
      activate($([ this ]));
      event.preventDefault();
    });
  });
};