<%@ page import="java.util.*" %>
<!DOCTYPE html>
<html lang="es-MX" ng-app="app">
<head>
  <title>NEW</title>
  <meta charset="utf-8">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <base href="">
  <link href="/mgrm_mult_web_gestionbanqueros_01/resources/assets/icons/favicon/A/favicon_NEW_32.ico" rel="icon">
  <link href="/mgrm_mult_web_gestionbanqueros_01/resources/css/main.css" rel="stylesheet">
  <link href="/mgrm_mult_web_gestionbanqueros_01/resources/lib/animate.css/animate.min.css" rel="stylesheet">
  <link href="/mgrm_mult_web_gestionbanqueros_01/resources/lib/nvd3/build/nv.d3.min.css" rel="stylesheet">
  <link href="/mgrm_mult_web_gestionbanqueros_01/resources/css/print.css" media="print" rel="stylesheet">
  <script>
    var serverConfig = {
      "dynPath": "./New",
      "forceMocks": true
    };
    var architecture = {
      "aso": "https://150.250.220.36:18500",
      "grantingTicket": "https://150.250.220.36:18500/TechArchitecture/mx/grantingTicket/V02/",
      "iv_user": "<%= request.getHeader("iv-user") %>",
      "iv_ticketservice": "<%= request.getHeader("iv_ticketservice") %>",
      "tsec": ""
    };
  </script>
</head>

<body ng-controller="GlobalController as global">
  <div class="container">
    <header ng-if="global.session">
      <img class="logo" alt="BBVA Bancomer" src="assets/img/logo.gif">
      <div class="corporate">
        <span>CORPORATE &</span>
        <span>INVESTMENT BANKING</span>
      </div>
      <div class="info-container">
        <div class="info">
          <span class="user">{{ global.session }}</span>
          <button class="btn-delete" ng-click="global.logout()">Salir</button>
          <span class="title">Sistema de Notas Estructuradas y Warrants</span>
          <span class="date">{{ global.today | date:"dd/MM/yyyy hh:mm a" }}</span>
        </div>
      </div>
    </header>
    <nav menu ng-show="global.session &amp;&amp; global.session_banker">
      <li>
        <a class="home"></a>
      </li>
      <li>
        <a nav="#!/portafolios-inversion" class="briefcase">Portafolios de Inversi&oacute;n</a>
      </li>
    </nav>
    <div class="content" ng-cloak ng-view></div>
  </div>
  <modal name="global.Messages.ui" size="{small: !global.Messages.message.listaErrores, 'medium-small': global.Messages.message.listaErrores}">
    <ng-include src="'app/globals/modal/messages.html'"></ng-include>
  </modal>
  <!-- build:js js/dist.js-->
  <!-- bower:js-->
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/jquery/dist/jquery.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/jquery-ui/jquery-ui.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angular/angular.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angular-route/angular-route.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angular-messages/angular-messages.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angular-ui-validate/dist/validate.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/scriptjs/dist/script.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/chart.js/dist/Chart.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angular-chart.js/dist/angular-chart.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angularjs-slider/dist/rzslider.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angular-dragdrop/src/angular-dragdrop.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angular-cookies/angular-cookies.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/clipboard/dist/clipboard.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angularUtils-pagination/dirPagination.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angular-animate/angular-animate.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angular-sanitize/angular-sanitize.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/d3/d3.min.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/nvd3/build/nv.d3.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/angular-nvd3/dist/angular-nvd3.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/lib/lodash/lodash.js"></script>
  <!-- endbower-->
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/modules/app.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/modules/app.directives.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/modules/app.extensions.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/modules/app.filters.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/modules/app.routes.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/modules/app.services.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/providers/route-helper.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/decorators/http-multipart.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/factories/api-builder.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/factories/http-interceptor.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/factories/patterns.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/filter/days-between.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/filter/filesize.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/clipboard/clipboard.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/countdown/countdown.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/currency-input/currency-input.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/date-input/date-input.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/switchSearch/switchSearch.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/datepicker/lib.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/datepicker/datepicker.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/dropdown/dropdown.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/input-file/input-file.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/menu/menu.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/modal/modal.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/nav/nav.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/progress/progress.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/resizer/lib.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/resizer/resizer.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/restrict-input/restrict-input.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/scrollTo/scrollTo.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/directives/spinner/spinner.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/services/dates-helper.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/js/services/messages.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/app/globals/global-controller.js"></script>
  <script src="/mgrm_mult_web_gestionbanqueros_01/resources/app/globals/global-service.js"></script>
  <!-- endbuild-->
  <spinner></spinner>
</body>

</html>