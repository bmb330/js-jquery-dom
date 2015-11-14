(function() {
  var tabPanel = function($li) {
    return $($li.find('a').attr('href'));
  }

  $.fn.tabs = function(){
    $.each(this, function(i, ul){
      var $ul = $([ul]);
      var $activeLi;

      $.each($ul.children(), function(i, li){
        var $li = $([li]);
        if(i == 0) {
          $activeLi = $li;
        }
        else {
          var $div = tabPanel($li);
          $div.hide();
        }
      });

      $ul.children().bind('click', function(ev) {
        ev.preventDefault();
        tabPanel($activeLi).hide();
        $activeLi = $([this]);
        tabPanel($activeLi).show();
      });
    });
  };
})();

$('#breeds').tabs();
