#!/bin/bash
cleanup() {
    echo -e "\nCtrl + C detectado! Executando ação de limpeza..."
    docker compose -f infra/compose.yaml down
    echo "Ação de limpeza executada com sucesso!"
    exit 0
}

trap cleanup SIGINT
echo "Pressione Ctrl + C para encerrar e executar a ação..."

while true; do
    sleep 1
done