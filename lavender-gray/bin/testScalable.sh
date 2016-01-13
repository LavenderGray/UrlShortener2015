export BasePORT=$(($PORT_INIT+1))
export StatisticsPORT=$(($PORT_INIT+2))
export QRPORT=$(($PORT_INIT+3))
export Base="localhost:"$BasePORT
export Statistics="localhost:"$StatisticsPORT
export QR="localhost:"$QRPORT
PORT=$StatisticsPORT node StatisticsServer.js &
export B=$(echo $!)
PORT=$QRPORT node QRServer.js &
export C=$(echo $!)
PORT=$BasePORT node BaseServer.js &
export A=$(echo $!)



export ScalablePORT=$(($PORT_INIT+0))
export Scalable="localhost:"$ScalablePORT
PORT=$ScalablePORT node ScalableServer.js &
export D=$(echo $!)

echo "Press enter to finish"
read -r line

kill -9 $A
kill -9 $B
kill -9 $C
kill -9 $D
