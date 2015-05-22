<?php

   require_once('Storage.php');
   $storage = new Storage('products');
   // $storage = new Storage('_beierm__products', 'db.f4.htw-berlin.de', 'beierm', 'PASSWORT');

   $method = $_SERVER['REQUEST_METHOD'];
   $request = explode("/", substr(@$_SERVER['PATH_INFO'], 1));

   $id = filter_var($request[0], FILTER_SANITIZE_NUMBER_INT);

   switch ($method) {

      case 'GET':

         if ($id)
            respond($storage->get($id));
         else
            respond($storage->all());
         break;


      case 'PUT':
      case 'POST':

         $json = json_decode(file_get_contents('php://input'), true);

         $name = filter_var($json['name'], FILTER_SANITIZE_STRING);
         $url = filter_var($json['url'], FILTER_SANITIZE_URL);
         $image = filter_var($json['image'], FILTER_SANITIZE_URL);
         $price = filter_var($json['price'], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION | FILTER_FLAG_ALLOW_THOUSAND);

         if ($id && $storage->get($id))
            respond($storage->edit(array($name, $url, $image, $price, $id)));
         else
            respond($storage->add(array($name, $url, $image, $price)), 201);
         break;


      case 'DELETE':

         if ($id && $storage->get($id))
            respond($storage->delete($id));
         else
            respond(false, 404);
         break;


      default:

         header('Allow: GET, POST, PUT, DELETE', true, 405);
   }

   function respond($data, $status = 200) {
      header('Content-Type: application/json', true, $status);
      header('Cache-Control: no-cache');
      exit(json_encode($data));
   }

?>