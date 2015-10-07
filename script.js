/*!
 * listAttributes jQuery Plugin v1.1.0
 *
 * Copyright 2010, Michael Riddle
 * Licensed under the MIT
 * http://jquery.org/license
 *
 * Date: Sun Mar 28 05:49:39 2010 -0900
 *
 *https://jquery-list-attributes.googlecode.com/files/jquery.listAttributes.js
 */
if (jQuery) {
    jQuery(document).ready(function() {
        jQuery.fn.listAttributes = function(prefix) {
            var list = [];
            $(this).each(function() {
                //console.info(this);
                var attributes = [];
                for (var key in this.attributes) {
                    if (!isNaN(key)) {
                        if (!prefix || this.attributes[key].name.substr(0, prefix.length) == prefix) {
                            attributes.push(this.attributes[key].value);
                        }
                    }
                }
                list.push(attributes);
            });
            return (list.length > 1 ? list : list[0]);
        };
    });
}

var guids;
$(window).on("hashchange", function() {
    guids = getGuids();
});

function getGuids() {
    if (!location.hash) {
        return JSON.parse(localStorage.getItem("guids") || "[]");
    }
    var guids = location.hash.slice(1).split(",");
    localStorage.setItem("guids", JSON.stringify(guids));
    history.replaceState(undefined, document.title, location.href.slice(0, location.href.indexOf("#")));
    history.back()
    return guids;
}

var Cache = {
    saveDelay: 1000,
    timeoutId: undefined,
    set: function(key, value) {
        if (this.ttl !== Infinity) {
            value.timestamp = Date.now();
        }
        this.cache[key] = value;
        this.save();
    },
    isStale: function(key) {
        if (this.cache[key] === undefined || this.ttl === Infinity) {
            return true;
        }
        if (this.cache[key].timestamp + this.ttl >= Date.now()) {
            return false;
        }
        delete this.cache[key];
        this.save();
        return true;
    },
    save: function() {
        if (this.timeoutId) {
            this.timeoutId = clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(this._save.bind(this), this.saveDelay);
    },
    _save: function() {
        this.timeoutId = undefined;
        localStorage.setItem(this.key, JSON.stringify(this.cache));
    },
    init: function(options) {
        this.key = options.key;
        this.ttl = options.ttl || Infinity;
        this.cache = JSON.parse(localStorage.getItem(this.key) || "{}");
        return this;
    },
    constructor: Cache
};
var items = Object.create(Cache).init({ key: "itemCache" });
var skins = Object.create(Cache).init({ key: "skinCache" });
var unknownItems = Object.create(Cache).init({ key: "unknownItemCache", ttl: 24 * 60 * 60 * 1000 });
var dyes = Object.create(Cache).init({ key: "dyeCache" });
var wallet = Object.create(Cache).init({ key: "walletCache" });
var guilds = Object.create(Cache).init({ key: "guildCache", ttl: 24 * 60 * 60 * 1000 });
var icons = {
    fr: "https://www.iconfinder.com/data/icons/fatcow/16/flag_france.png",
    en: "https://cdn2.iconfinder.com/data/icons/fatcow/16x16/flag_great_britain.png",
    sp: "https://cdn2.iconfinder.com/data/icons/fatcow/16x16/flag_spain.png",
    de: "https://cdn2.iconfinder.com/data/icons/fatcow/16x16/flag_germany.png",
    sacs: "https://cdn0.iconfinder.com/data/icons/fatcow/16/box_open.png",
    skins: "https://cdn0.iconfinder.com/data/icons/fatcow/16/ribbon.png",
    wallet: "https://cdn0.iconfinder.com/data/icons/fatcow/16/total_plan_cost.png",
    dyes: "https://cdn3.iconfinder.com/data/icons/fatcow/16/color_wheel.png",
    contacts: "https://cdn3.iconfinder.com/data/icons/fatcow/16/book_addresses.png",
    mails: "https://cdn2.iconfinder.com/data/icons/fatcow/16x16/email_air.png",
    settings: "https://cdn0.iconfinder.com/data/icons/fatcow/16/gear_in.png",
    no: "https://iconfinder.com/data/icons/fatcow/16/cross.png",
    yes: "https://iconfinder.com/data/icons/fatcow/16/tick.png",
    cloth: "https://render.guildwars2.com/file/7FBA68B71DB805E416315067DD0DDEEB204CFC65/63577.png",
    leather: "https://render.guildwars2.com/file/BB34A319132236042659CE7B31DF6FA890FF6501/65954.png",
    metal: "https://render.guildwars2.com/file/D1941454313ACCB234906840E1FB401D49091B96/220460.png",
    Female: "https://iconfinder.com/data/icons/fatcow/16/female.png",
    Male: "https://iconfinder.com/data/icons/fatcow/16/male.png",
    Asura: "https://wiki.guildwars2.com/images/1/1f/Asura_tango_icon_20px.png",
    Charr: "https://wiki.guildwars2.com/images/f/fa/Charr_tango_icon_20px.png",
    Human: "https://wiki.guildwars2.com/images/e/e1/Human_tango_icon_20px.png",
    Norn: "https://wiki.guildwars2.com/images/3/3d/Norn_tango_icon_20px.png",
    Sylvari: "https://wiki.guildwars2.com/images/2/29/Sylvari_tango_icon_20px.png",
    Elementalist: "https://wiki.guildwars2.com/images/a/aa/Elementalist_tango_icon_20px.png",
    Engineer: "https://wiki.guildwars2.com/images/2/27/Engineer_tango_icon_20px.png",
    Guardian: "https://wiki.guildwars2.com/images/8/8c/Guardian_tango_icon_20px.png",
    Mesmer: "https://wiki.guildwars2.com/images/6/60/Mesmer_tango_icon_20px.png",
    Necromancer: "https://wiki.guildwars2.com/images/4/43/Necromancer_tango_icon_20px.png",
    Ranger: "https://wiki.guildwars2.com/images/4/43/Ranger_tango_icon_20px.png",
    Revenant: "https://wiki.guildwars2.com/images/b/b5/Revenant_tango_icon_20px.png",
    Thief: "https://wiki.guildwars2.com/images/7/7a/Thief_tango_icon_20px.png",
    Warrior: "https://wiki.guildwars2.com/images/4/43/Warrior_tango_icon_20px.png",
    Armorsmith: "http://wiki.guildwars2.com/images/3/32/Armorsmith_tango_icon_20px.png",
    Artificer: "http://wiki.guildwars2.com/images/b/b7/Artificer_tango_icon_20px.png",
    Chef: "http://wiki.guildwars2.com/images/8/8f/Chef_tango_icon_20px.png",
    Huntsman: "http://wiki.guildwars2.com/images/f/f3/Huntsman_tango_icon_20px.png",
    Jeweler: "http://wiki.guildwars2.com/images/f/f2/Jeweler_tango_icon_20px.png",
    Leatherworker: "http://wiki.guildwars2.com/images/e/e5/Leatherworker_tango_icon_20px.png",
    Tailor: "http://wiki.guildwars2.com/images/4/4d/Tailor_tango_icon_20px.png",
    Weaponsmith: "http://wiki.guildwars2.com/images/4/46/Weaponsmith_tango_icon_20px.png",
    undefined: "https://wiki.guildwars2.com/images/8/86/Any_tango_icon_20px.png"
};
var endPoint = "https://api.guildwars2.com/v2/";
var unkItem = {
    icon: "http://wiki.guildwars2.com/images/1/1d/Deleted_Item.png",
    name: "Objet non identifié",
    rarity: "Unknown",
    level: "0",
    type: "Unknown"
};
var emptySlot = {
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNiYAAAAAkAAxkR2eQAAAAASUVORK5CYII=",
    name: "Slot vide",
    rarity: "Empty",
    level: "0",
    type: "Empty"
};

function formatDate(t) {
    return new Date(t).toLocaleDateString();
}

function getURL(path, key) {
    var url = endPoint + path;
    if (key) {
        url += "?access_token=" + key;
    }
    return url;
}

function buildVer() {
    var url = "https://api.guildwars2.com/v2/build";
    $.getJSON(url, function(data){
        $("#build").html(data.id);
    });
}

$(window).load(function() {
    buildVer();
    $("label").each(function() {
        if (icons[$(this).attr("class")]) {
            $(this).prepend($("<img/>").attr({src: icons[$(this).attr("class")], class: "icon", alt: $(this).attr("class"), title: $(this).attr("class") }));
        };
    });
    guids = getGuids();
    initEvents();
});

function initEvents() {
    $("#menu").hover(function() {
        $("#menuDiv").toggle();
    });
    $("#getBuilds").click(getBuilds);
    $("#getWallet").click(getWallet);
    $("#getBags").click(getBags);
    $("#filter").keyup(itemFilter);
    $("#reloadButton").click(getBags);
    $("#filterContainer").hover(function() {
        $("#filterDiv").toggle();
    });
    $("ul.tabs li").click(function() {
        var tabId = $(this).attr("toShow");

        $("ul.tabs li").removeClass("current");
        $(".tabContent").removeClass("current");

        $(this).addClass("current");
        $("#" + tabId).addClass("current");
    });
    $(".checkAll").change(function() {
        $("input:checkbox." + $(this).attr("ctrl")).prop("checked", $(this).prop("checked"));
        var filt = $(this).attr("ctrl");
        if (filt == "rarity" || filt == "type") {
            itemFilter();
        } else {
            charFilter();
        }
    });
    $(".rarity,.type").change(itemFilter);
    $(".gender,.race,.prof").change(charFilter);
    $("#items .levFilter").keyup(itemFilter);
    $("#chars .levFilter").keyup(charFilter);
    $("#getWard").click(getWard);
    $("#getDyes").click(getDyes);
    $("#getPvP").click(getPvP);
    $("#build").click(buildVer);
}

// BUILDS start
function getBuilds() {
    $("section").removeClass("visible");
    $("#builds").addClass("visible").empty().text("WORK IN PROGRESS...");
    var url = getURL("character/:id/specializations", key);
}
// BUILDS end
// WALLET start
function getWallet() {
    $("section").removeClass("visible");
    $("#walletHead").addClass("visible");
    $("#wallet").addClass("visible").empty().append($("<table/>").prop("id","currList").append($("<tr/>").addClass("thead").append($("<td/>").addClass("currName").prop("title","name"))));
    $.getJSON("https://api.guildwars2.com/v2/currencies?ids=all", function(data) {
        var result;
        data.sort(function(a,b) {return a.order > b.order;});
        for(var curr in data) {
            result += "<tr title=\"" + data[curr].description + "\"><td id=\"curr" + data[curr].id + "\" class=\"currName\">" + data[curr].name + "</td><td><img src=\"" + data[curr].icon + "\" class=\"icon\"></td></tr>";
        }
        $("#currList tr:last-of-type").after(result);
    });
    $.each(guids, function(i, key) {
        var url = getURL("account", key);
        $.getJSON(url, function(data) {
            var accName = data.name;
            var url = getURL("account/wallet", key);
            $.getJSON(url, function(data) {
                $("tr.thead .currName").after($("<td/>").text(accName));
                $("tr:not(.thead) .currName").after($("<td/>"));
                for(var curr in data) {
                    $("#curr"+data[curr].id+"+ td").text(data[curr].value);
                }
            });
        });
    });
}
// WALLET end
// BAGS start
function getBags() {
    $("section").removeClass("visible");
    $("#dyes").empty()
    $("#bagStuffHead, #bagStuff").addClass("visible");
    $("#bagStuff").empty();
    $("#filter").val("");
    $("input:checkbox").prop("checked", true);
    $(".levFilter").val("");
    $.each(guids, function(i, key) {
        var url = getURL("account", key);
        $.getJSON(url, function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
            $("#bagStuff").append($("<div/>").addClass(account + " account"));
            $("." + account).append($("<h2/>").text(accName).attr("title", "Créé le " + formatDate(data.created)));
            var url = getURL("worlds/" + data.world, key);
            $.getJSON(url, function(wdata) {
                $("." + account).append($("<h6/>").text(wdata.name));
            });
            getContent(key, account);
        });
    });

    Promise.resolve()
    .then(sortStuff())
    .then(sortAcc())
    .catch(function(err) {
        console.error("Erreur getBags : ", err);
    });

    document.querySelector("#filter").focus();
}

function getContent(key, account) {
    var url = getURL("characters", key);
    $.getJSON(url, function(data) {
        var charsDiv = $("<div/>").addClass("characters");
        $("." + account).append(charsDiv);
        $.each(data, function(i, charName) {
            getCharData(charName, key, account);
        });
        getBankData(key, account);
        getMatsData(key, account);
    });
}

function getCharData(character, key, account) {
    var url = getURL("characters/" + character, key);
    var charDiv = $("<div/>").addClass("character");
    $("." + account + " .characters").append(charDiv);
    $.getJSON(url, function(charData) {
        var addE = (charData.gender == "Male") ? "": "e";
        var discis = "";
        $.each(charData.crafting, function(i, disci) {
            if (disci) {
                discis += "<br><img src=\"" + icons[disci.discipline] + "\" class=\"icon " + disci.discipline + "\" alt=\"" + disci.discipline + "\" title=\"" + disci.discipline + "\">" + disci.rating;
            }
        });
        charDiv.append($("<div/>").addClass("title").text(character),$("<div/>").addClass("spec").append($("<img/>").attr({src: icons[charData.gender], class: "icon " + charData.gender, alt: charData.gender, title: charData.gender }), $("<img/>").attr({src: icons[charData.race], class: "icon " + charData.race, alt: charData.race, title: charData.race }), $("<img/>").attr({src: icons[charData.profession], class: "icon " + charData.profession, alt: charData.profession, title: charData.profession }), charData.level + "<br>Né" + addE + " le " + formatDate(charData.created) + "<br>" + charData.deaths + " décès" + discis)).attr({race: charData.race,prof: charData.profession,gender: charData.gender,level: charData.level});
        var itemsDiv = $("<div/>").addClass("stuff");
        charDiv.append(itemsDiv);
        getBag(charData.equipment, itemsDiv);
        $.each(charData.bags, function(i, bag) {
            if (!bag) { return; }
            var itemsDiv = $("<div/>").addClass("bag");
            charDiv.append(itemsDiv);
            getBag(bag.inventory, itemsDiv);
        });
        var guildId = charData.guild;
        if (guildId) {
            function insertGuildIntoPage(guildData) {
                charDiv.append($("<img/>").addClass("charBg").attr("src", "http://guilds.gw2w2w.com/" + guildId + ".svg"));
                var addTag = charDiv.children("div.title");
                addTag.append(" [" + guildData.tag + "]");
            }
            if (guilds.isStale(guildId)) {
                var url = "https://api.guildwars2.com/v1/guild_details?guild_id=" + guildId;
                $.getJSON(url, function(gdata) {
                    guilds.set(guildId, gdata);
                    insertGuildIntoPage(gdata);
                });
            } else {
                insertGuildIntoPage(guilds.cache[guildId]);
            }
        }
    });
}

function getBankData(key, account) {
    var url = getURL("account/bank", key);
    $.getJSON(url, function(bankData) {
        var charDiv = $("<div/>").addClass("bank");
        var itemsDiv = $("<div/>").addClass("bankTabs");
        charDiv.append($("<span/>").addClass("title").text("Banque"),itemsDiv);
        while (bankData.length) {
            getBag(bankData.splice(0, 150), itemsDiv);
        }
        $("." + account).append(charDiv);
    });
}

function getMatsData(key, account) {
    var url = getURL("account/materials", key);
    $.getJSON(url, function(matsData) {
        var charDiv = $("<div/>").addClass("mats");
        var itemsDiv = $("<div/>").addClass("matsTabs");
        charDiv.append($("<span/>").addClass("title").text("Matériaux"),itemsDiv);
        while (matsData.length) {
            getBag(matsData.splice(0, 150), itemsDiv);
        }
        $("." + account).append(charDiv);
    });
}

function getBag(bag, target) {
    var itemIDs = [];
    var skinIDs = [];
    for (var bagItem of bag) {
        if (bagItem) {
            if (!items.cache[bagItem.id] && unknownItems.isStale(bagItem.id)) {
                itemIDs.push(bagItem.id);
            }
            if (bagItem.skin && !skins.cache[bagItem.skin] && unknownItems.isStale(bagItem.skin)) {
                skinIDs.push(bagItem.skin);
            }
        }
    };
    Promise.resolve()
    .then(loadItems.bind(this, skinIDs, "skins"))
    .then(loadItems.bind(this, itemIDs, "items"))
    .catch(function(err) {
        console.error("Erreur : ", err);
    })
    .then(updateBag.bind(this, bag, target));
}

function loadItems(ids, type) {
    if (!ids.length) {
        return;
    }
    var url = getURL(type) + "?ids=" + ids.join(",");
    return $.getJSON(url, function(data) {
        $.each(data, function(i, itemData) {
            eval(type).set(itemData.id, itemData);
        });
    }).fail(function(jqXHR) {
        if (jqXHR.status === 404) {
            ids.forEach(function(id) {
                unknownItems.set(id, {});
            })
        }
    });
}

function updateBag(bag, target) {
    for (var bagItem of bag) {
        if (bagItem) {
            bagItem.item = items.cache[bagItem.id];
            bagItem.sk = skins.cache[bagItem.skin];
            if (!bagItem.item) {
                bagItem.item = $.extend(true, {}, unkItem);
                bagItem.item.name += " [" + bagItem.id + "]";
            }
            target.append(createBagItem(bagItem));
        }
        else {
            target.append(createBagItem(null));
        }
    };
}

function createBagItem(bagItem) {
    if (!bagItem) {
        var bagItem = {slot: "emptyslot", item: $.extend(true, {}, emptySlot)};
    }
    var itemSlot = $("<div/>").addClass("item").addClass("r_" + bagItem.item.rarity)
    .attr({
        type: bagItem.item.type,
        level: bagItem.item.level,
        slot: bagItem.slot ? bagItem.slot : "notstuff"})
    .append($("<img/>").attr({
        src: bagItem.skin ? bagItem.sk.icon : bagItem.item.icon,
        title: bagItem.skin ? bagItem.sk.name : bagItem.item.name}))
    .data("name", bagItem.skin ? bagItem.sk.name.toLowerCase() : bagItem.item.name.toLowerCase());
    if (bagItem.count > 1) {
        itemSlot.append($("<span/>").text(bagItem.count).addClass("count"));
    }
    else if (bagItem.count < 1) {
        itemSlot.addClass("r_Empty");
    }
    return itemSlot;
}

function sortStuff() {
    return $(".stuff").each(function() {
        $(this).append(
            $("<div/>").append(
                $("<div/>").append(
                    $(this).find("[slot=Helm]").length ? $(this).find("[slot=Helm]") : createBagItem(null),
                    $(this).find("[slot=Shoulders]").length ? $(this).find("[slot=Shoulders]") : createBagItem(null),
                    $(this).find("[slot=Coat]").length ? $(this).find("[slot=Coat]") : createBagItem(null),
                    $(this).find("[slot=Gloves]").length ? $(this).find("[slot=Gloves]") : createBagItem(null),
                    $(this).find("[slot=Leggings]").length ? $(this).find("[slot=Leggings]") : createBagItem(null),
                    $(this).find("[slot=Boots]").length ? $(this).find("[slot=Boots]") : createBagItem(null)),
                $("<div/>").append(
                    $(this).find("[slot=WeaponA1]").length ? $(this).find("[slot=WeaponA1]") : createBagItem(null),
                    $(this).find("[slot=WeaponA2]").length ? $(this).find("[slot=WeaponA2]") : createBagItem(null),
                    $(this).find("[slot=WeaponB1]").length ? $(this).find("[slot=WeaponB1]") : createBagItem(null),
                    $(this).find("[slot=WeaponB2]").length ? $(this).find("[slot=WeaponB2]") : createBagItem(null)),
                $("<div/>").append(
                    $(this).find("[slot=HelmAquatic]").length ? $(this).find("[slot=HelmAquatic]") : createBagItem(null),
                    $(this).find("[slot=WeaponAquaticA]").length ? $(this).find("[slot=WeaponAquaticA]") : createBagItem(null),
                    $(this).find("[slot=WeaponAquaticB]").length ? $(this).find("[slot=WeaponAquaticB]") : createBagItem(null)),
                $("<div/>").append(
                    $(this).find("[slot=Backpack]").length ? $(this).find("[slot=Backpack]") : createBagItem(null),
                    $(this).find("[slot=Accessory1]").length ? $(this).find("[slot=Accessory1]") : createBagItem(null),
                    $(this).find("[slot=Accessory2]").length ? $(this).find("[slot=Accessory2]") : createBagItem(null),
                    $(this).find("[slot=Amulet]").length ? $(this).find("[slot=Amulet]") : createBagItem(null),
                    $(this).find("[slot=Ring1]").length ? $(this).find("[slot=Ring1]") : createBagItem(null),
                    $(this).find("[slot=Ring2]").length ? $(this).find("[slot=Ring2]") : createBagItem(null))).css("display","flex"),
$("<div/>").append(
    $(this).find("[slot=Sickle]").length ? $(this).find("[slot=Sickle]") : createBagItem(null),
    $(this).find("[slot=Axe]").length ? $(this).find("[slot=Axe]") : createBagItem(null),
    $(this).find("[slot=Pick]").length ? $(this).find("[slot=Pick]") : createBagItem(null))
);
});
}

function sortAcc() {
   return $(".account").each(function() {
    $(this).append(
        $(this).find("h2"),
        $(this).find("h6"),
        $(this).find(".characters"),
        $(this).find(".bank"),
        $(this).find(".mats"));
});
}
// FILTERS for BAGS start
function itemFilter() {
    $(".rarity + .Empty").prev().prop("checked", $(".rarity:not(:hidden):checked,.type:checked").length == $(".rarity:not(:hidden),.type").length ? 1 : 0);
    var levIMin = ($("#levIMin").val() == "") ? 0 : parseInt($("#levIMin").val());
    var levIMax = ($("#levIMax").val() == "") ? 80 : parseInt($("#levIMax").val());
    var filterValue = $("#filter").val().toLowerCase();
    var toHide = $("#items input:checkbox:not(:checked,.checkAll)").map(function() {
        return $(this).next("label").attr("class");
    }).get();
    $(".item").each(function() {
        var itemLev = parseInt($(this).attr("level"));
        var name = $(this).data("name");
        var itemAttr = [$(this).attr("class").split(" ")[1].slice(2),$(this).attr("type")];
        if (
            levIMin > itemLev ||
            itemLev > levIMax ||
            name.indexOf(filterValue) < 0 ||
            itemAttr.some(function(x) {
                return toHide.indexOf(x) > -1;
            })
            ) {
            $(this).addClass("hidden");
        } else {
            $(this).removeClass("hidden");
        }
    });
    charFilter();
}

function charFilter() {
    var levCMin = ($("#levCMin").val() == "") ? 1 : parseInt($("#levCMin").val());
    var levCMax = ($("#levCMax").val() == "") ? 80 : parseInt($("#levCMax").val());
    var toHide = $("#chars input:checkbox:not(:checked,.checkAll)").map(function() {
        return $(this).next("label").attr("class");
    }).get();
    $(".character").each(function() {
        var charLev = parseInt($(this).attr("level"));
        var charAttr = $(this).listAttributes();
        var amIEmpty = $(this).find(".item:not(.hidden)").length;
        if (
            amIEmpty == 0 ||
            levCMin > charLev ||
            charLev > levCMax ||
            charAttr.some(function(x) {
                return toHide.indexOf(x) > -1;
            })
            ) {
            $(this).addClass("hidden");
        } else {
            $(this).removeClass("hidden");
        }
    });
}
// FILTERS for BAGS end
// BAGS end
// WARDROBE start
function getWard() {
    $("section").removeClass("visible");
    $("#wardrobe").addClass("visible").empty().text("WORK IN PROGRESS...");
    $.each(guids, function(i, key) {
        var url = getURL("account/skins", key);
        $.getJSON(url, function(data) {

        });
    });
}
// WARDROBE end
// DYES start
function getDyes() {
    $("section").removeClass("visible");
    $("#dyesHead").addClass("visible");
    $("#dyes").addClass("visible").empty().append($("<table/>").prop("id","dyeList").append($("<tr/>").addClass("thead").append($("<td/>").prop("title","cloth"),$("<td/>").prop("title","leather"),$("<td/>").prop("title","metal"))));
    $(".thead td").each(function() {
        $(this).append($("<img/>").addClass("icon").attr({src:icons[$(this).attr("title")],alt:$(this).attr("title")})).css({"color":"rgba(0,0,0,0)","background-color":"black"});
    });
    $.getJSON("https://api.guildwars2.com/v2/colors?ids=all", function(data) {
        var result;
        data.sort(function(a,b) {return a.name.localeCompare(b.name);});
        for(var dye in data) {
            result += "<tr id=\"dye" + data[dye].id + "\"><td colspan=\"3\" style=\"background: -moz-linear-gradient(left, rgb(" + data[dye].cloth.rgb.join() + ") 33%, rgb(" + data[dye].leather.rgb.join() + ") 33%, rgb(" + data[dye].leather.rgb.join() + ") 66%, rgb(" + data[dye].metal.rgb.join() + ") 66%);text-shadow: 0px 0px 5px rgba(0, 0, 0, 1);\" class=\"dyename\">" + data[dye].name + "</td></tr>";
        }
        $("#dyeList tr:last-of-type").after(result);
    });
    $.each(guids, function(i, key) {
        var url = getURL("account", key);
        $.getJSON(url, function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
            var url = getURL("account/dyes", key);
            $.getJSON(url, function(data) {
                $("tr.thead td[title=metal]").after($("<td/>").text(accName));
                $("#dyeList tr:not(.thead) .dyename").after($("<td/>").addClass(account).append($("<img/>").attr({src: icons["no"],alt: "0"})));
                for(var id in data) {
                    $("#dye"+data[id]+" td."+account+" img").attr({src: icons["yes"],alt: "1"});
                }
            });
        });
    });
}
// DYES end
// PVP start
function getPvP() {
    $("section").removeClass("visible");
    $("#pvp").addClass("visible").empty().text("WORK IN PROGRESS...");
    var url = getURL("pvp/games", key);
    var url = getURL("pvp/stats", key);
}
// PVP end
