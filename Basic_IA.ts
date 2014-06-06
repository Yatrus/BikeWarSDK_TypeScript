/*!
 * BikeWar Javascript BAsic IA
 * http://www.codeofwar.net
 *
 *
 * Copyright 2014 Tamina
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * author : david mouton
 */

/**
 * Déclaration des variables globales
 */
declare var postMessage;
declare var com;
declare var UID;
declare var bikeNum


/**
 * Le nom de l'IA
 * @property name
 * @type String
 */

var name = "Id.iot";

var color = 0;

/**
 * Le message à sortir dans la console à la fin du tour
 * @property debugMessage
 * @type String
 */
var debugMessage = "";

/**
 * Id de l'IA
 * @property id
 * @type String
 */
var id = 0;


onmessage = function(event) {
    if (event.data != null) {
        var turnMessage = event.data;
        id = turnMessage.playerId;
        var orders = [];
        var msg = "";
        try {
            orders = getOrders(turnMessage.data);
            msg = debugMessage;
        } catch (e) {
            msg = 'Error : ' + e;
        }
        postMessage(new TurnResult(orders, msg));
    }
    else postMessage("data null");
};


var _turnNum = 1;
var _movingTruckId = new Array();

/**
 * Cette méthode est appelée par le système tout les tours
 * @method getOrders
 * @param    context {MapData} l'ensemble des données de la partie
 * @return    result {Array<Order>} la liste des ordres à exécuter ce tour
 */
var getOrders = function(context) {
    var result = new Array();
    var _g1 = 0;
    var _g = context.trucks.length;
    while (_g1 < _g) {
        var i = _g1++;
        var truck = context.trucks[i];
        if (truck.owner.id == this.id && truck.currentStation != null) {
            if (this._movingTruckId.indexOf(truck.id) > -1) {
                HxOverrides.remove(this._movingTruckId, truck.id);
                if (truck.currentStation.bikeNum < truck.currentStation.slotNum / 4) {
                    if (truck.bikeNum > 0) result.push(new UnLoadingOrder(truck.id, truck.currentStation.id, 1));
                } else if (truck.currentStation.bikeNum > truck.currentStation.slotNum / 4 * 3) {
                    if (truck.bikeNum < Game.TRUCK_NUM_SLOT) result.push(new LoadingOrder(truck.id, truck.currentStation.id, 1));
                } else if (GameUtils.hasStationEnoughBike(truck.currentStation)) {
                    if (truck.bikeNum < Game.TRUCK_NUM_SLOT) result.push(new LoadingOrder(truck.id, truck.currentStation.id, 1));
                }
            } else {
                this._movingTruckId.push(truck.id);
                result.push(new MoveOrder(truck.id, context.stations[Math.round(Math.random() * context.stations.length)].id));
            }
        } else {
        }
    }
    this._turnNum++;
    return result;
};

/**
 * La Map
 * <br/> Contient l'ensemble des données de la partie
 * @class MapData
 * @constructor
 */
var MapData = function() {
    /**
     * La liste des joueurs
     * @property players
     * @type Array<Player>
     */
    this.players = [];

    /**
     * La liste des stations de vélo
     * @property stations
     * @type Array<BikeStation>
     */
    this.stations = [];

    /**
     * La liste des camions
     * @property trucks
     * @type Array<Truck>
     */
    this.trucks = [];

    /**
     * La date courante
     * @property currentTime
     * @type Date
     */
    this.currentTime = new Date();

    /**
     * La liste des routes
     * @property roads
     * @type Array<Junction>
     */
    this.roads = [];
};

/**
 * Station de Vélo
 * @class BikeStation
 * @constructor
 */
var BikeStation = function() {
    /**
     * L'id de la station
     * @property id
     * @type Float
     */
    this.id = 0.0;

    /**
     * Le nombre de vélo
     * @property bikeNum
     * @type Int
     */
    this.bikeNum = 0;

    /**
     * Le nombre d'emplacement pour vélo
     * @property slotNum
     * @type Int
     */
    this.slotNum = 0;

    /**
     * La position de la station sur la Map
     * @property position
     * @type Junction
     */
    this.position = null;

    /**
     * Le proprietaire
     * @property owner
     * @type Player
     */
    this.owner = null;

    /**
     * Le profil de la station.
     * le nombre moyen de vélo en station entre 00h00 et 23h45, toutes les 15 minutes.
     * @property profile
     * @type Array<Int>
     */
    this.profile = [];

    /**
     * Le nom de la station
     * @property name
     * @type String
     */
    this.name = '';

};

/**
 * Classe de base des Ordres à éxécuter par le systeme
 * @class Order
 */
class Order {
    constructor(public truckId: number, public targetStationId: number, public type: String) { }
}


/**
 * Ordre de déplacement
 * @class MoveOrder
 * @constructor
 * @param    truckId  {Float} L'id du camion concerné par cet ordre
 * @param    targetStationId {Float} La station de destination
 */
var MoveOrder = function(truckId, targetStationId) {
    MoveOrder.prototype = Object.create(Order.prototype);
    Order.apply(this, [truckId, targetStationId, OrderType.MOVE]);
};

/**
 * Ordre de chargement
 * @class LoadingOrder
 * @constructor
 * @param    truckId  {Float} L'id du camion concerné par cet ordre
 * @param    targetStationId {Float} La station de destination
 * @param    bikeNum {Int} Le nombre de vélo à charger
 */
var LoadingOrder = function(truckId, targetStationId, bikeNum) {
    LoadingOrder.prototype = Object.create(Order.prototype);
    Order.apply(this, [truckId, targetStationId, OrderType.LOAD]);

    /**
     * Le nombre de vélo à charger
     * @property bikeNum
     * @type Int
     */
    this.bikeNum = bikeNum;
};

/**
 * Ordre de déchargement des vélos
 * @class UnLoadingOrder
 * @constructor
 * @param    truckId  {Float} L'id du camion concerné par cet ordre
 * @param    targetStationId {Float} La station ciblée
 * @param    bikeNum {Int} Le nombre de vélo à décharger
 */
var UnLoadingOrder = function(truckId, targetStationId, bikeNum) {
    UnLoadingOrder.prototype = Object.create(Order.prototype);
    Order.apply(this, [truckId, targetStationId, OrderType.UNLOAD]);

    /**
     * Le nombre de vélo à décharger
     * @property bikeNum
     * @type Int
     */
    this.bikeNum = bikeNum;
};

/**
 * Enumeration des types d'ordres
 * @class OrderType
 */
var OrderType = {

    /**
     * Ordre de déplacement
     * @property MOVE
     * @type String
     */
    MOVE: "move",

    /**
     * Ordre de chargement de vélo
     * @property LOAD
     * @type String
     */
    LOAD: "load",

    /**
     * Ordre de déchargement de vélo
     * @property UNLOAD
     * @type String
     */
    UNLOAD: "unload",

    /**
     * Ordre de rien du tout
     * @property NONE
     * @type String
     */
    NONE: "none"
};


/**
 * Joueur
 * @class Player
 * @constructor
 * @param    name {String}
 * @param    color {String}
 * @param    script {String}
 */
var Player = function(name, script, color) {
    /**
     * Le nom de l'IA
     * @property name
     * @type String
     */
    this.name = name;
    this.script = script;
    this.color = color;

    /**
     * Id de l'IA
     * @property id
     * @type String
     */
    this.id = UID.get();
};

 
//class TurnMessage{
//    constructor (public playerId : string, public galaxy){}
//}




class TurnResult {
    error: string = "";
    consoleMessage: string;
    constructor(public orders, message) {
        (message == null) ? this.consoleMessage = "" : this.consoleMessage = message;        
    }
}


/**
 * @class Point
 * @param x:Number
 * @param y:Number
 */
class Point {
    constructor(public x: number, public y: number) { }

};



/**
 * @class Junction
 * @extends Point
 * @param x:Number
 * @param y:Number
 * @param id:String
 */
var Junction = function(x, y, id) {
    Junction.prototype = Object.create(Point.prototype);
    Order.apply(this, [x, y]);
    /**
     * La liste des Junction liées
     * @property links
     * @type Array<Junction>
     */
    this.links = [];
    this.id = id;


    this.bikeNum = bikeNum;
};

/**
 * Tendance d'une Station
 * @class Trend
 */
var Trend = {

    /**
     * Décroissante
     * @property DECREASE
     * @type Int
     * @default -1
     * @static
     */
    DECREASE: -1,

    /**
     * Croissante
     * @property INCREASE
     * @type Int
     * @default 1
     * @static
     */
    INCREASE: 1,

    /**
     * Stable
     * @property STABLE
     * @type Int
     * @default 0
     * @static
     */
    STABLE: 0

};

/**
 * Camion
 * @class Truck
 */
var Truck = function(owner, currentStation) {

    /**
     * L'Id du camion
     * @property id
     * @type Float
     */
    this.id = UID.get();

    /**
     * Le proprietaire du camion
     * @property owner
     * @type Player
     */
    this.owner = owner;

    /**
     * Le nombre de vélo embarqué
     * @property bikeNum
     * @type Int
     */
    this.bikeNum = 0;

    /**
     * La position du camion
     * @property position
     * @type Point
     */
    this.position = currentStation.position;

    /**
     * Si il s'y trouve, la station actuelle.
     * @property currentStation
     * @type BikeStation
     */
    this.currentStation = currentStation;

}

/**
 * Classe utilitaire
 * @class GameUtils
 */
class GameUtils {

    //Indique le nombre de tour necessaire à un camion pour rejoindre une station
    static getTravelDuration(source, target) {
        var result = 1000;
        result = Math.ceil(GameUtils.getDistanceBetween(source.position, target.position) / Game.TRUCK_SPEED);
        return result;
    }

    //Détermine la distance qui sépare deux Points en pixel
    static getDistanceBetween(p1, p2) {
        return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
    }

    //Si la station se trouve dans sa zone optimale
    static hasStationEnoughBike(station) {
        return (station.bikeNum > station.slotNum / 4 && station.bikeNum < station.slotNum / 4 * 3);
    }

    // Récupere le chemin le plus court entre deux stations
    static getPath(fromStation, toStation, map) {
        var p = new PathFinder();
        return p.getPath(fromStation, toStation, map);
    }
    //Indique la tendance d'une station à un instant particulier
    getBikeStationTrend(target, time) {
        var currentIndex = time.getHours() * 4 + Math.floor(time.getMinutes() * 4 / 60);
        var nextIndex = currentIndex + 1;
        if (nextIndex + 1 > target.profile.length) {
            nextIndex = 0;
        }
        return target.profile[nextIndex] - target.profile[currentIndex];
    }


};






/**
 * Constantes du jeu
 * @class Game
 */
var Game = {
    //La vitesse d'execution d'un tour.
    GAME_SPEED: 100,
    //Le nombre maximum de tour
    GAME_MAX_NUM_TURN: 500,
    // La vitesse d'un camion
    TRUCK_SPEED: 60,
    //La capacité d'un camion
    TRUCK_NUM_SLOT: 10,
    // La durée maximale du tour d'une IA. Si l'IA dépasse cette durée, elle passe en timeout.
    MAX_TURN_DURATION: 1000,
    //La durée d'un tour en ms. ex 15 minutes/tours
    TURN_TIME: 1000 * 30 * 15
};


class PathFinder {
     static __name__ = true
     _inc
     _paths
     _map
     _source
     _target
     _result

    constructor() {
        this._inc = 0;
        this._paths = new Array();
    }

    getPath(fromStation, toStation, map) {
        this._map = map;
        this._source = this.getJunctionByStation(fromStation);
        this._target = this.getJunctionByStation(toStation);
        var p = new Path();
        p.push(this._source);
        this._paths.push(p);
        this.find();
        return this._result;
    }
    getJunctionByStation(station) {
        var result = null;
        var _g1 = 0;
        var _g = this._map.roads.length;
        while (_g1 < _g) {
            var i = _g1++;
            var j = this._map.roads[i];
            if (j.x == station.position.x && j.y == station.position.y) {
                result = j;
                break;
            }
        }
        return result;
    }
    find() {
        var result = false;
        this._inc++;
        var paths = this._paths.slice();
        var _g1 = 0;
        var _g = paths.length;
        while (_g1 < _g) {
            var i = _g1++;
            if (this.checkPath(paths[i])) {
                result = true;
                break;
            }
        }
        if (!result && this._inc < 50) this.find();
    }
    checkPath(target) {
        var result = false;
        var currentJunction = target.getLastItem();
        var _g1 = 0;
        var _g = currentJunction.links.length;
        while (_g1 < _g) {
            var i = _g1++;
            var nextJunction = currentJunction.links[i];
            if (nextJunction.id == this._target.id) {
                result = true;
                var p = target.copy();
                p.push(nextJunction);
                this._result = p;
                break;
            } else if (!Path.contains(nextJunction, this._paths)) {
                var p1 = target.copy();
                p1.push(nextJunction);
                this._paths.push(p1);
            }
        }
        HxOverrides.remove(this._paths, target);
        return result;
    }
    checkPathDirection(currentJunction) {
        var result = true;
        if (this._inc > 2) {
            if (this._source.x < this._target.x && currentJunction.x < this._source.x) result = false; else if (this._source.x > this._target.x && currentJunction.x > this._target.x) result = false;
        }
        return result;
    }

}



class Path {

    static __name__ = true;
    _content

    constructor(content?) {
        if (content == null) this._content = new Array(); else this._content = content;
    }

    static contains(item, list) {
        var result = false;
        var _g1 = 0;
        var _g = list.length;
        while (_g1 < _g) {
            var i = _g1++;
            if (list[i].hasItem(item)) {
                result = true;
                break;
            }
        }
        return result;
    }
    getLastItem() {
        return this._content[this._content.length - 1];
    }
    hasItem(item) {
        var result = false;
        var _g1 = 0;
        var _g = this._content.length;
        while (_g1 < _g) {
            var i = _g1++;
            if (item.id == this._content[i].id) {
                result = true;
                break;
            }
        }
        return result;
    }
    getGuide() {
        var result = new Array();
        var _g1 = 0;
        var _g = this._content.length;
        while (_g1 < _g) {
            var i = _g1++;
            result.push(this._content[i].x - 8);
            result.push(this._content[i].y - 8);
        }
        return result;
    }
    getItemAt(index) {
        return this._content[index];
    }
    push(item) {
        this._content.push(item);
    }
    remove(item) {
        return HxOverrides.remove(this._content, item);
    }
    copy() {
        return new com.tamina.bikewar.data.Path(this._content.slice());
    }
    get_length() {
        return this._content.length;
    }
}




class HxOverrides {

    static __name__ = true;

    static indexOf(a, obj, i) {
        var len = a.length;
        if (i < 0) {
            i += len;
            if (i < 0) i = 0;
        }
        while (i < len) {
            if (a[i] === obj) return i;
            i++;
        }
        return -1;
    }
    static remove(a, obj) {
        var i = HxOverrides.indexOf(a, obj, 0);
        if (i == -1) return false;
        a.splice(i, 1);
        return true;
    }
}


