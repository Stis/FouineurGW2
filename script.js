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
var guids;
var items = Object.create(Cache).init({ key: "itemCache" });
var skins = Object.create(Cache).init({ key: "skinCache" });
var unknownItems = Object.create(Cache).init({ key: "unknownItemCache", ttl: 24 * 60 * 60 * 1000 });
var dyes = Object.create(Cache).init({ key: "dyeCache" }); // finalement, il semble
var wallet = Object.create(Cache).init({ key: "walletCache" }); // que j'ai oublié
var sharedBag = Object.create(Cache).init({ key: "sharedBag" }); // de me servir de ça
var guilds = Object.create(Cache).init({ key: "guildCache", ttl: 24 * 60 * 60 * 1000 });
var icons = {
    de: "img/de.png",
    en: "img/en.png",
    es: "img/es.png",
    fr: "img/fr.png",
    ko: "img/ko.png",
    zh: "img/zh.png",
    builds: "img/specialisation.png",
    wallet: "img/portefeuille.png",
    sacs: "img/sacs.png",
    skins: "img/garderobe.png",
    dyes: "img/teintures.png",
    recipes: "img/recettes.png",
    pvp: "img/jcj.png",
    daily: "img/succes.png",
    dailypve: "img/quotijce.png",
    contacts: "img/contacts.png",
    mails: "img/courriers.png",
    settings: "img/reglages.png",
    no: "img/no.png",
    yes: "img/yes.png",
    comm: "img/commandant.png",
    cloth: "img/tissu.png",
    leather: "img/cuir.png",
    metal: "img/metal.png",
    Female: "img/femelle.png",
    Male: "img/male.png",
    Asura: "img/asura.png",
    Charr: "img/charr.png",
    Human: "img/humain.png",
    Norn: "img/norn.png",
    Sylvari: "img/sylvari.png",
    Elementalist: "img/elementaliste.png",
    Engineer: "img/ingenieur.png",
    Guardian: "img/gardien.png",
    Mesmer: "img/envouteur.png",
    Necromancer: "img/necromant.png",
    Ranger: "img/rodeur.png",
    Revenant: "img/revenant.png",
    Thief: "img/voleur.png",
    Warrior: "img/guerrier.png",
    Armorsmith: "img/forgarmure.png",
    Artificer: "img/artificier.png",
    Chef: "img/maitrequeu.png",
    Huntsman: "img/chasseur.png",
    Jeweler: "img/bijoutier.png",
    Leatherworker: "img/travducuir.png",
    Scribe: "img/illustration.png",
    Tailor: "img/tailleur.png",
    Weaponsmith: "img/forgarme.png",
    PlayForFree: "img/P4F.ico",
    GuildWars2: "img/GW2.ico",
    HeartOfThorns: "img/HoT.ico",
    undefined: "img/nondefini.png"
};
var endPoint = "https://api.guildwars2.com/v2/";
var unkItem = {
    icon: "img/enconstruction.png",
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
    key ? url += "?access_token=" + key : "";
    return url;
}

function buildVer() {
    $.getJSON(getURL("build"), function(data){
        $("#build").html(data.id);
    });
}

$(window).load(function() {
    buildVer();
    $("label").each(function() {
        if (icons[$(this).attr("class")]) {
            $(this).prepend($("<img/>").attr({src: icons[$(this).attr("class")], alt: $(this).attr("class"), title: $(this).attr("class") }));
        };
    });
    guids = JSON.parse(localStorage.getItem("guids") || "[]");
    initEvents();
});

function initEvents() {
    if ($("#intro:not(.hidden)")) {
        if (guids) {
            $.each(guids, function(i, key) {
                $("#keyList").append(key+"\n");
            });
            $("#keyList").html($("#keyList").val().replace(/\n$/, ""));
        }
    }
    $("#saveKeys").click(function() {
        guids = $("#keyList").val().replace("#","").split(/\n| |,/);
        localStorage.setItem("guids", JSON.stringify(guids));
        location.reload(true);
    });
    $("#delKeys").click(function() {
        localStorage.removeItem("guids");
        location.reload();
    });
    $("#menu").hover(function() {
        $("#menuDiv").toggle();
    });
    $("#getBuilds").click(getBuilds);
    $("#getWallet").click(getWallet);
    $("#getBags").click(getBags);
    $("#filter").keyup(itemFilter);
    $("#reloadBags").click(getBags);
    $("#filterContainer").hover(function() {
        $("#filterDiv").toggle();
    });
    $(".tab").click(function() {
        var tabId = $(this).attr("toShow");

        $(".tab").removeClass("current");
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
    $(".simpleFilter").keyup(function() {simpleFilter($(this));});
    $("#getWard").click(getWard);
    $("#reloadWard").click(getWard);
    $("#getMinis").click(getMinis);
    $("#reloadMinis").click(getMinis);
    $("#getDyes").click(getDyes);
    $("#reloadDyes").click(getDyes);
    $("#getRecipes").click(getRecipes);
    $("#reloadReci").click(getRecipes);
    $("#getPvP").click(getPvP);
    $("#getDaily").click(function() {getDaily("today");});
    $("#getDailyTom").click(function() {getDaily("tomorrow");});
    $("#build").click(buildVer);
}

function resetView(who) {
    $("section").removeClass("visible");
    $("#content section").empty();
    $(".simpleFilter").val("");
    $("#"+who+",#"+who+"Head").addClass("visible");
}

function simpleFilter(who) {
    var filterValue = who.val().toLowerCase();
    $("tr:not(.thead)").each(function() {
        var name = $(this).data("name");
        if (name.indexOf(filterValue) < 0) {
            $(this).addClass("hidden");
        } else {
            $(this).removeClass("hidden");
        }
    });
}

// BUILDS start
function getBuilds() {
    resetView("builds");
}
// BUILDS end
// WALLET start
function getWallet() {
    resetView("wallet");
    $("#wallet").append($("<table/>").prop("id","currList").append($("<tr/>").addClass("thead").append($("<td/>").addClass("currName").prop("title","name"))));
    $.getJSON(getURL("currencies?ids=all"), function(data) {
        var result;
        data.sort(function(a,b) {return a.order > b.order;});
        $.each(data, function(i, curr) {
            result += "<tr title=\"" + curr.description + "\"><td id=\"curr" + curr.id + "\" class=\"currName\">" + curr.name + "</td><td><img src=\"" + curr.icon + "\" class=\"icon\"></td></tr>";
        });
        $("#currList tr:last-of-type").after(result);
    });
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            $.getJSON(getURL("account/wallet", key), function(data) {
                $("tr.thead .currName").after($("<td/>").text(accName));
                $("tr:not(.thead) .currName").after($("<td/>"));
                $.each(data, function(i, curr) {
                    $("#curr"+curr.id+"+ td").text(curr.value);
                });
            });
        });
    });
}
// WALLET end
// BAGS start
function getBags() {
    resetView("bagStuff");
    $("#filter").val("");
    $("input:checkbox").prop("checked", true);
    $(".levFilter").val("");
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
            var typAcc = data.access;
            $.getJSON(getURL("worlds/" + data.world), function(wdata) {
                $("#bagStuff").append($("<div/>").addClass(account + " account").append($("<h2/>").append(data.commander ? $("<img/>").attr({src: icons["comm"]}) : "",accName,$("<img/>").attr({src: icons[typAcc], alt: typAcc, title: typAcc })).attr("title", "Créé le " + formatDate(data.created)),$("<h5/>").addClass("server").text(wdata.name),$("<h5/>").addClass("fractlev").text("Niv. fractale : " + data.fractal_level)));
                getContent(key, account);
            });
        });
        if (i == guids.length){ sortStuff();};
    });

    document.querySelector("#filter").focus();
}

function getContent(key, account) {
    $.getJSON(getURL("characters", key), function(data) {
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
    var charDiv = $("<div/>").addClass("character");
    $("." + account + " .characters").append(charDiv);
    $.getJSON(getURL("characters/" + character, key), function(charData) {
        var addE = (charData.gender == "Male") ? "": "e";
        var discis = "";
        $.each(charData.crafting, function(i, disci) {
            if (disci) {
                disciInactive = disci.active ? "" : " class=\"inactive\"";
                discis += "<br><span"+ disciInactive +"><img src=\"" + icons[disci.discipline] + "\" class=\"icon " + disci.discipline + "\" alt=\"" + disci.discipline + "\" title=\"" + disci.discipline + "\">" + disci.rating + "</span>";
            }
        });
        var itemsDiv = $("<div/>").addClass("stuff");
        var sharedBag = $("<div/>").addClass("sharedBag");
        charDiv.append($("<div/>").addClass("title").text(character),
                       $("<div/>").addClass("spec").append($("<img/>").attr({src: icons[charData.gender], class: "icon " + charData.gender, alt: charData.gender, title: charData.gender }),
                                                           $("<img/>").attr({src: icons[charData.race], class: "icon " + charData.race, alt: charData.race, title: charData.race }),
                                                           $("<img/>").attr({src: icons[charData.profession], class: "icon " + charData.profession, alt: charData.profession, title: charData.profession }),
                                                           charData.level +
                                                           "<br>Né" + addE + " le " + formatDate(charData.created) +
                                                           "<br>" + charData.deaths + " décès" +
                                                           discis),
                       itemsDiv,
                       sharedBag
                       ).attr({race: charData.race,prof: charData.profession,gender: charData.gender,level: charData.level});
        getBag(charData.equipment, itemsDiv);
        $.getJSON(getURL("account/inventory", key), function(sharedBagData) {
            getBag(sharedBagData, sharedBag);
        });
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
                $.getJSON("https://api.guildwars2.com/v1/guild_details?guild_id=" + guildId, function(gdata) {
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
    $.getJSON(getURL("account/bank", key), function(bankData) {
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
    $.getJSON(getURL("account/materials", key), function(matsData) {
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
    return $.getJSON(getURL(type + "?ids=" + ids.join(",")), function(data) {
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
    if (bagItem.sk) {
        JSON.stringify(bagItem.sk.flags).search("OverrideRarity") > 1 ? bagItem.item.rarity = bagItem.sk.rarity : "";
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
                    $(this).find("[slot=Ring2]").length ? $(this).find("[slot=Ring2]") : createBagItem(null))).addClass("flexme"),
            $("<div/>").append(
                $(this).find("[slot=Sickle]").length ? $(this).find("[slot=Sickle]") : createBagItem(null),
                $(this).find("[slot=Axe]").length ? $(this).find("[slot=Axe]") : createBagItem(null),
                $(this).find("[slot=Pick]").length ? $(this).find("[slot=Pick]") : createBagItem(null))
        );
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
    resetView("wardrobe");
    $("#wardrobe").append($("<table/>").prop("id","wardList").append($("<thead/>").append($("<tr/>").addClass("thead").append($("<td/>").addClass("thead"),$("<td/>").addClass("thead")))));
    // $("#wardrobe").append($("<table/>").prop("id","wardList").append($("<thead/>").append($("<tr/>").addClass("thead").append($("<td/>").addClass("thead"),
    //                                                                                                                           $("<td/>").addClass("thead").text("ID"),
    //                                                                                                                           $("<td/>").addClass("thead").text("Nom"),
    //                                                                                                                           $("<td/>").addClass("thead").text("Type"),
    //                                                                                                                           $("<td/>").addClass("thead").text("Ss-type"),
    //                                                                                                                           $("<td/>").addClass("thead").text("Slot"),
    //                                                                                                                           $("<td/>").addClass("thead").text("Flags"),
    //                                                                                                                           $("<td/>").addClass("thead").text("Race")
    //                                                                                                                           ))));
    jQuery.ajaxSetup({async:false});
    $.getJSON(getURL("skins?page=1000&page_size=200"), function() {}).fail(function(data, err) {
        var searchURL = "http://wiki.guildwars2.com/index.php?title=Special%3ASearch&go=Go&search=";
        var count = data.responseText.slice(data.responseText.lastIndexOf("- ")+2, data.responseText.lastIndexOf("."));
        while (count > -1) {
            $.getJSON(getURL("skins?page="+count+"&page_size=200"), function(data) {
                for(var skin in data) {
                    var desc = data[skin].description || "";
                    $("#wardList").append($("<tr/>").attr({id: "skin" + data[skin].id}).data("name", data[skin].name.toLowerCase()).append(
                        $("<td/>").html("<img src=\""+data[skin].icon+"\" title=\""+desc +"\">"),
                        $("<td/>").addClass("skinname "+data[skin].rarity).html("<a href=\""+searchURL+data[skin].name+" skin\">"+data[skin].name+"</a>")
                        ));
                    // $("#wardList").append($("<tr/>").attr({id: "skin" + data[skin].id}).data("name", data[skin].name.toLowerCase()).append(
                    //     $("<td/>").html("<img src=\""+data[skin].icon+"\" title=\""+desc +"\" style=\"width: 36px; margin-bottom:-5px;\">"),
                    //     $("<td/>").addClass("id").text(data[skin].id),
                    //     $("<td/>").addClass("skinname "+data[skin].rarity).text(data[skin].name),
                    //     $("<td/>").addClass("type").text(data[skin].type),
                    //     $("<td/>").addClass("weightordam").text(data[skin].details.weight_class ? data[skin].details.weight_class : data[skin].details.damage_type),
                    //     $("<td/>").addClass("details_type").text(data[skin].details.type),
                    //     $("<td/>").addClass("flags").text(data[skin].flags),
                    //     $("<td/>").addClass("restrictions").text(data[skin].restrictions)
                    //     ));
                }
            });
            count--;
        }
    });
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
            $.getJSON(getURL("account/skins", key), function(data) {
                $("#wardList tr.thead td:last-of-type").after($("<td/>").text(accName));
                $("#wardList tr:not(.thead)  td:last-of-type").after($("<td/>").addClass(account).append($("<img/>").attr({src: icons["no"],alt: "0"}).addClass("yesno")));
                for(var id in data) {
                    $("#skin"+data[id]+" td."+account+" img").attr({src: icons["yes"],alt: "1"});
                }
            });
        });
    });
    jQuery.ajaxSetup({async:true});
}
// WARDROBE end
// MINIATURES start
function getMinis() {
    resetView("miniatures");
    $("#miniatures").append($("<table/>").prop("id","minisList").append($("<thead/>").append($("<tr/>").addClass("thead").append($("<td/>").addClass("thead"),$("<td/>").addClass("thead")))));
    var searchURL = "http://wiki.guildwars2.com/index.php?title=Special%3ASearch&go=Go&search=";
    $.getJSON(getURL("minis?ids=all"), function(data) {
        data.sort(function(a,b) {return a.order > b.order;});
        for(var mini in data) {
            var unlock = data[mini].unlock || "";
            $("#minisList").append($("<tr/>").attr({id: "mini" + data[mini].id}).data("name", data[mini].name.toLowerCase()).append(
                $("<td/>").html("<img src=\""+data[mini].icon+"\" title=\""+unlock +"\">"),
                $("<td/>").addClass("mininame").html("<a href=\""+searchURL+data[mini].item_id+"\">"+data[mini].name+"</a>")
                ));
        }
    });
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
            $.getJSON(getURL("account/minis", key), function(data) {
                $("#minisList tr.thead td:last-of-type").after($("<td/>").text(accName));
                $("#minisList tr:not(.thead)  td:last-of-type").after($("<td/>").addClass(account).append($("<img/>").attr({src: icons["no"],alt: "0"}).addClass("yesno")));
                for(var id in data) {
                    $("#mini"+data[id]+" td."+account+" img").attr({src: icons["yes"],alt: "1"});
                }
            });
        });
    });
}
// MINIATURES end
// DYES start
function getDyes() {
    resetView("dyes");
    $("#dyes").append($("<table/>").prop("id","dyeList").append($("<tr/>").addClass("thead").append($("<td/>").prop("title","cloth"),$("<td/>").prop("title","leather"),$("<td/>").prop("title","metal"))));
    $(".thead td").each(function() {
        $(this).append($("<img/>").attr({src:icons[$(this).attr("title")],alt:$(this).attr("title")}));
    });
    $.getJSON(getURL("colors?ids=all"), function(data) {
        data.sort(function(a,b) {return a.name.localeCompare(b.name);});
        for(var dye in data) {
            $("#dyeList").append($("<tr/>").attr({id: "dye" + data[dye].id}).data("name", data[dye].name.toLowerCase()).append($("<td/>").attr({colspan: "3", style: "background: -moz-linear-gradient(left, rgb(" + data[dye].cloth.rgb.join() + ") 33%, rgb(" + data[dye].leather.rgb.join() + ") 33%, rgb(" + data[dye].leather.rgb.join() + ") 66%, rgb(" + data[dye].metal.rgb.join() + ") 66%);text-shadow: 0px 0px 5px rgba(0, 0, 0, 1);"}).addClass("dyename").text(data[dye].name)));
        }
    });
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
            $.getJSON(getURL("account/dyes", key), function(data) {
                $("tr.thead td[title=metal]").after($("<td/>").text(accName));
                $("#dyeList tr:not(.thead) .dyename").after($("<td/>").addClass(account).append($("<img/>").attr({src: icons["no"],alt: "0"}).addClass("yesno")));
                for(var id in data) {
                    $("#dye"+data[id]+" td."+account+" img").attr({src: icons["yes"],alt: "1"});
                }
            });
        });
    });
}
// DYES end
// RECIPES start
function getRecipes() {
    resetView("recipes");
    $("#recipes").text("WORK IN PROGRESS...");
}
// RECIPES end
// PVP start
function getPvP() {
    resetView("pvp");
    $("#pvp").text("WORK IN PROGRESS...");
}
// PVP end
// DAILY start
function getDaily(when) {
    resetView("daily");
    $("#daily").append($("<table/>").prop("id","dailyList"));
    switch(when) {
        case "today": var url = getURL("achievements/daily"); break;
        case "tomorrow": var url = getURL("achievements/daily/tomorrow");
    }
    $.getJSON(url, function(data) {
        var ids = [];
        var levels = [];
        $.each(data, function(i, pvx) {
            ids = ids.concat(pvx.map(ach => ach.id));
            // levels = levels.concat(pvx.map(ach => "\""+ach.id+"\":{\"min\":"+ach.level.min+",\"max\":"+ach.level.max+"}"));
        });
        $.getJSON(getURL("achievements?ids="+ids), function(dailyAch) {
            dailyAch.sort(function(a,b) {return a.id > b.id;});
            var dummy=88;
            $.each(dailyAch, function(i, oneAch) {
                oneIcon = oneAch.icon ? oneAch.icon : icons["dailypve"];
                $("#dailyList").append($("<tr/>").append(
                "<td title=\""+oneAch.id+"\"><img src=\""+oneIcon+"\"></td>",
                "<td title=\""+oneAch.description+"\">"+oneAch.name+"</td>",
                "<td>"+oneAch.requirement+"</td>",
                "<td width=100>Min. : "+dummy+"<br>Max. : "+dummy+"</td>"
                ));
            });
        });
    });
}
// DAILY end
