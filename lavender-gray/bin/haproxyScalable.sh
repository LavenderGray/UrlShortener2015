export PORT_INIT=8111
PORT=$(($PORT_INIT+31)) node StatisticsServer.js &
export B1=$(echo $!)
PORT=$(($PORT_INIT+32)) node StatisticsServer.js &
export B2=$(echo $!)
PORT=$(($PORT_INIT+33)) node StatisticsServer.js &
export B3=$(echo $!)
PORT=$(($PORT_INIT+34)) node StatisticsServer.js &
export B4=$(echo $!)

PORT=$(($PORT_INIT+21)) node QRServer.js &
export C1=$(echo $!)
PORT=$(($PORT_INIT+22)) node QRServer.js &
export C2=$(echo $!)
PORT=$(($PORT_INIT+23)) node QRServer.js &
export C3=$(echo $!)
PORT=$(($PORT_INIT+24)) node QRServer.js &
export C4=$(echo $!)

PORT=$(($PORT_INIT+11)) node BaseServer.js &
export A1=$(echo $!)
PORT=$(($PORT_INIT+12)) node BaseServer.js &
export A2=$(echo $!)
PORT=$(($PORT_INIT+13)) node BaseServer.js &
export A3=$(echo $!)
PORT=$(($PORT_INIT+14)) node BaseServer.js &
export A4=$(echo $!)

echo "Press enter to finish"
read -r line

kill -9 $A1
kill -9 $A2
kill -9 $A3
kill -9 $A4

kill -9 $B1
kill -9 $B2
kill -9 $B3
kill -9 $B4

kill -9 $C1
kill -9 $C2
kill -9 $C3
kill -9 $C4
