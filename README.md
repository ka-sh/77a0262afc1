# 77a0262afc1

This is a simple web-api to calculate shortest route.

To calculate the shortest route I am using the following :
  - Google distance matrix API to fetch distances between each location.
  - Google node_or_tools lib, to calculate shortest route based on destination.

 > Originally I wanted to use Google directions API, however, since it consider
 > time as the main cost, I had to revert to node_or_tools.

 The steps to find the shortest route is as follows:
 - User google distance matrix api to fetch distances between each node.
 - Generate cost matrix based on the distance.
 - Use node_or_tools to calculate shortest path, as far as I understand main method used to solve the problem is via constraint programming.
 - Once shortest path is found, we use the original cost matrix to calculate total distance, traveling time.

 ### Docker & scaling

 As one of the requirements is to Dockerize the app, and make it so to be horizontally scalable. Considering these requirements, I decided
 to use nginx-proxy as a dynamic load-balancer.

 In a ideal scenario we can do the following:

 docker-compose up
 docker-compose scale app=4

 nginx-proxy will take care of the load-balancing for us without much configurations.

 **Note: since we are using nginx-proxy, all request going to the api need to have customized header with {Host:app.local}**

 ### Start

 To start the
  - docker-compose up
  - docker-compose scale app=n

 ### To request shortest route

 [Post http://localhost/]

 ```
 body{
   destinations:[[22.275820,114.155968],[22.271829,114.163070],[22.267377,114.151866],[22.265556,114.163442]]
 }
 ```

 ### To check token status

 [GET http://localhost/route/:Token]
