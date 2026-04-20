#!/bin/bash
# Run this on the medecins machine (172.20.10.7)

echo "Adding specialites..."
curl -X POST http://localhost:8085/specialites -H "Content-Type: application/json" -d '{"nom":"Neurologie","description":"Maladies du systeme nerveux"}'
curl -X POST http://localhost:8085/specialites -H "Content-Type: application/json" -d '{"nom":"Pediatrie","description":"Medecine des enfants"}'
curl -X POST http://localhost:8085/specialites -H "Content-Type: application/json" -d '{"nom":"Orthopedie","description":"Maladies des os et articulations"}'

echo -e "\n\nAdding medecins..."
curl -X POST http://localhost:8085/medecins -H "Content-Type: application/json" -d '{"nom":"Martin","prenom":"Sophie","email":"s.martin@hopital.fr","telephone":"0611111111","disponible":true,"specialite":{"id":1,"nom":"Cardiologie","description":"Maladies du coeur"}}'
curl -X POST http://localhost:8085/medecins -H "Content-Type: application/json" -d '{"nom":"Dubois","prenom":"Pierre","email":"p.dubois@hopital.fr","telephone":"0622222222","disponible":true,"specialite":{"id":2,"nom":"Dermatologie","description":"Maladies de la peau"}}'
curl -X POST http://localhost:8085/medecins -H "Content-Type: application/json" -d '{"nom":"Bernard","prenom":"Claire","email":"c.bernard@hopital.fr","telephone":"0633333333","disponible":true,"specialite":{"id":3,"nom":"Medecine generale","description":"Consultations generales"}}'
curl -X POST http://localhost:8085/medecins -H "Content-Type: application/json" -d '{"nom":"Leroy","prenom":"Marc","email":"m.leroy@hopital.fr","telephone":"0644444444","disponible":true,"specialite":{"id":4,"nom":"Neurologie","description":"Maladies du systeme nerveux"}}'
curl -X POST http://localhost:8085/medecins -H "Content-Type: application/json" -d '{"nom":"Moreau","prenom":"Julie","email":"j.moreau@hopital.fr","telephone":"0655555555","disponible":true,"specialite":{"id":1,"nom":"Cardiologie","description":"Maladies du coeur"}}'
curl -X POST http://localhost:8085/medecins -H "Content-Type: application/json" -d '{"nom":"Simon","prenom":"Thomas","email":"t.simon@hopital.fr","telephone":"0666666666","disponible":true,"specialite":{"id":5,"nom":"Pediatrie","description":"Medecine des enfants"}}'
curl -X POST http://localhost:8085/medecins -H "Content-Type: application/json" -d '{"nom":"Laurent","prenom":"Emma","email":"e.laurent@hopital.fr","telephone":"0677777777","disponible":true,"specialite":{"id":6,"nom":"Orthopedie","description":"Maladies des os et articulations"}}'

echo -e "\n\nDone! Check http://localhost:8085/medecins"
