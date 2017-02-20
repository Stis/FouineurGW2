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
var guids        = JSON.parse(localStorage.getItem("guids") || "[]");
var guilds       = Object.create(Cache).init({ key: "guildCache", ttl: 24 * 60 * 60 * 1000 });
var items        = Object.create(Cache).init({ key: "itemCache" });
var itemsUnk     = Object.create(Cache).init({ key: "itemUnkCache", ttl: 24 * 60 * 60 * 1000 });
var itemstats    = Object.create(Cache).init({ key: "itemstatCache" });
var itemstatsUnk = Object.create(Cache).init({ key: "itemstatUnkCache", ttl: 24 * 60 * 60 * 1000 });
var skins        = Object.create(Cache).init({ key: "skinCache" });
var skinsUnk     = Object.create(Cache).init({ key: "skinUnkCache", ttl: 24 * 60 * 60 * 1000 });
var icons = {
    de: "img/de.png",
    en: "img/en.png",
    es: "img/es.png",
    fr: "img/fr.png",
    ko: "img/ko.png",
    zh: "img/zh.png",
    builds: "img/specialisation.png",
    identities: "img/identites.png",
    wallet: "img/portefeuille.png",
    sacs: "img/sacs.png",
    skins: "img/garderobe.png",
    dyes: "img/teintures.png",
    titles: "img/titres.png",
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
    Fractals : "img/fractales.png",
    WvWRank: "img/rangmcm.png",
    PvPRank: "img/rangjcj.png",
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
    PlayForFree: "img/P4F.png",
    GuildWars2: "img/GW2.png",
    HeartOfThorns: "img/HoT.png",
    Birthday: "img/anniversaire.png",
    Deaths: "img/deces.png",
    undefined: "img/nondefini.png"
};
var emptySlot = {
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNiYAAAAAkAAxkR2eQAAAAASUVORK5CYII=",
    name: "Slot vide",
    rarity: "Empty",
    level: "0",
    type: "Empty"
};
var unkItem = {
    icon: "img/enconstruction.png",
    name: "Objet non identifié",
    rarity: "Unknown",
    level: "0",
    type: "Unknown"
};

function formatDate(t) {
    return new Date(t).toLocaleDateString();
}

function formatNbr(zeNbr) {
    return new Intl.NumberFormat().format(zeNbr);
}

function formatPognon(zeNbr)
{
    return zeNbr = zeNbr.replace(/(\d+?)(\d{2})(\d{2})$/, '$1' + ' ' + '$2' + ' ' + '$3');
}

function getURL(endPoint, key) {
    var startURL = "https://api.guildwars2.com/v2/";
    var url = startURL + endPoint;
    key ? url += "?access_token=" + key : null;
    return url;
}

function buildVer() {
    $.getJSON(getURL("build"), function(data){
        $("#build").text(data.id);
    });
}

$(window).on("load", function() {
    buildVer();
    $("label").each(function() {
        if (icons[$(this).attr("class")]) {
            $(this).prepend($("<img/>").attr({src: icons[$(this).attr("class")], alt: $(this).attr("class"), title: $(this).attr("class") }));
        };
    });
    if ($("#intro:not(.hidden)")) {
        if (guids) {
            $.each(guids, function(i, key) {
                $("#keyList").append(key+"\n");
            });
            $("#keyList").html($("#keyList").val().replace(/\n$/, ""));
        }
    }
    $("#saveKeys").click(function() {
        guids = $("#keyList").val().split(/\n| |,/);
        localStorage.setItem("guids", JSON.stringify(guids));
        location.reload(true);
    });
    $("#delKeys").click(function() {
        localStorage.removeItem("guids");
        location.reload();
    });
    $("#menu").hover(function() {
        $("#menuPop").toggle();
    });
    $("#getBuilds").click(getBuilds);
    $("#getWallet").click(getWallet);
    $("#getIdents").click(getIdents);
    $("#getBags").click(getBags);
    $("#filterInp").keyup(itemFilter);
    $("#filter").hover(function() {
        $("#filterPop").toggle();
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
    $("#getMinis").click(getMinis);
    $("#getFinish").click(getFinish);
    $("#getDyes").click(getDyes);
    $("#getTitles").click(getTitles);
    $("#getRecipes").click(getRecipes);
    $("#getPvP").click(getPvP);
    $("#getDaily").click(function() {getDaily("today");});
    $("#getDailyTom").click(function() {getDaily("tomorrow");});
    $("#build").click(buildVer);
});

function resetView(who) {
    $("#content").empty();
    $("input[type=text]").val("");
    $("input:checkbox").prop("checked", true);
    $(".simplfilter, #filterInp, #filter, #items, #chars").addClass("hidden");
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
// IDENTS start
function getIdents() {
    resetView("bagStuff");
    $("#filter, #chars").removeClass("hidden");
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(accData) {
            $.getJSON(getURL("worlds/" + accData.world), function(worlData) {
                var account = accData.name.replace(/\s|\./g,"");
                var typAcc = accData.access;
                $("#content").append($("<div/>").addClass(account).append(accData.commander ? "<img src="+icons["comm"]+" class=\"icon\">" : null,
                                                                          $("<h2/>").append(accData.name).attr("title", "Créé le " + formatDate(accData.created)),
                                                                          $("<h4/>").addClass("server").text(worlData.name),
                                                                          $("<img/>").attr({src: icons[typAcc], class: "icon", alt: typAcc, title: typAcc })," - ",
                                                                          $("<span/>").addClass("fractlev").append($("<img/>").attr({src: icons["Fractals"], class: "icon", alt: "Niveau de fractales", title: "Niveau de fractales"}), accData.fractal_level)," - ",
                                                                          $("<span/>").addClass("wvwrank").append($("<img/>").attr({src: icons["WvWRank"], class: "icon", alt: "Rang McM", title: "Rang McM"}), formatNbr(accData.wvw_rank))," - ",
                                                                          $("<span/>").addClass("pvprank").append($("<img/>").attr({src: icons["PvPRank"], class: "icon", alt: "Rang JcJ", title: "Rang JcJ"}), $.getJSON(getURL("pvp/stats", key), function(pvpstats) {$("." + account + " .pvprank").append(pvpstats.pvp_rank)})),
                                                                          $("<div/>").addClass("characters flexme")
                                                                          )
                                    );
                $.getJSON(getURL("characters", key), function(charsList) {
                    $.each(charsList, function(i, charName) {
                        $.getJSON(getURL("characters/" + charName + "/core", key), function(charData) {
                            $.getJSON(getURL("characters/" + charName + "/crafting", key), function(charCraftData) {
                                var charDiv = $("<div/>").addClass("character" + " " + charData.race + " " + charData.profession + " " + charData.gender).attr({level: charData.level});
                                $("." + account + " .characters").append(charDiv);
                                var discis = "";
                                $.each(charCraftData.crafting, function(i, disci) {
                                    if (disci) {
                                        disciInactive = disci.active ? "" : " class=\"inactive\"";
                                        discis += "<br><span"+ disciInactive +"><img src=\"" + icons[disci.discipline] + "\" class=\"icon " + disci.discipline + "\" alt=\"" + disci.discipline + "\" title=\"" + disci.discipline + "\">" + disci.rating + "</span>";
                                    }
                                });
                                charDiv.append($("<div/>").addClass("name").text(charName),
                                               $("<div/>").addClass("title"),
                                                   charData.title ? $.getJSON(getURL("titles/"+charData.title), function(title) {charDiv.children(".title").text(title.name)})
                                                                     .fail(function() {charDiv.children(".title").text("<i>- non trouvé -</i>")}) : null,
                                               $("<div/>").addClass("bio"),
                                                   $.getJSON(getURL("characters/" + charName + "/backstory", key), function(bios) {
                                                     $.getJSON(getURL("backstory/answers?ids="+JSON.stringify(bios.backstory).replace(/\[|\]|\"/g,"")), function(choices) {
                                                       $.each(choices, function(i, choice) {
                                                         charDiv.children(".bio").append("<img src=\"img/bio/"+choice.id+".png\" class=\"icon\" alt=\""+choice.title+"\" title=\""+choice.title+"\">");
                                                       })})}),
                                               $("<div/>").addClass("spec").append(
                                                   $("<img/>").attr({src: icons[charData.gender], class: "icon " + charData.gender, alt: charData.gender, title: charData.gender }),
                                                   $("<img/>").attr({src: icons[charData.race], class: "icon " + charData.race, alt: charData.race, title: charData.race }),
                                                   $("<img/>").attr({src: icons[charData.profession], class: "icon " + charData.profession, alt: charData.profession, title: charData.profession }),
                                                   charData.level,
                                                   "<br>", $("<img/>").attr({src: icons["Birthday"], class: "icon "}), formatDate(charData.created),
                                                   "<br>", $("<img/>").attr({src: icons["Deaths"], class: "icon "}), formatNbr(charData.deaths),
                                                   discis)
                                              );
                                var guildId = charData.guild;
                                if (guildId) {
                                    function insertGuildIntoPage(guildData) {
                                        charDiv.children("div.name").append(" [" + guildData.tag + "]");
                                        charDiv.append($("<img/>").addClass("charBg").attr("src", "http://guilds.gw2w2w.com/" + guildId + ".svg"));
                                    }
                                    if (guilds.isStale(guildId)) {
                                        $.getJSON("https://api.guildwars2.com/v2/guild/" + guildId, function(guildData) {
                                            guilds.set(guildId, guildData);
                                            insertGuildIntoPage(guildData);
                                        });
                                    } else {
                                        insertGuildIntoPage(guilds.cache[guildId]);
                                    }
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}
// FILTERS for IDENTS start
function charFilter() {
    var levCMin = ($("#levCMin").val() == "") ? 1 : parseInt($("#levCMin").val());
    var levCMax = ($("#levCMax").val() == "") ? 80 : parseInt($("#levCMax").val());
    var toHide = $("#chars input:checkbox:not(:checked,.checkAll)").map(function() {
        return $(this).next("label").attr("class");
    }).get();
    $(".character").each(function() {
        var charLev = parseInt($(this).attr("level"));
        var charAttr = $(this).attr("class").split(" ").slice(1);
        if (
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
// FILTERS for IDENTS end
// IDENTS end
// WALLET start
function getWallet() {
    resetView("wallet");
    $("#content").append($("<table/>").prop("id","currList").append($("<tr/>").addClass("thead").append($("<td/>").addClass("currName"))));
    $.getJSON(getURL("currencies?ids=all"), function(data) {
        var result;
        data.sort(function(a,b) {return a.order > b.order;});
        $.each(data, function(i, curr) {
            curr.description = curr.description ? curr.description.replace(/\"/g,'&quot;') : null;
            result += "<tr title=\"" + curr.description + "\"><td id=\"curr" + curr.id + "\" class=\"currName\">" + curr.name + "</td><td class=\"ico\"><img src=\"" + curr.icon + "\"></td></tr>";
        });
        $("#currList tr:last-of-type").after(result);
    });
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            $.getJSON(getURL("account/wallet", key), function(data) {
                $("tr.thead .currName").after($("<td/>").addClass("accName").text(accName));
                $("tr:not(.thead) .currName").after($("<td/>"));
                $.each(data, function(i, curr) {
                    if (curr.id == "1") {
                        $("#curr"+curr.id+"+ td").text(formatPognon(curr.value+''));
                    }
                    else {
                        $("#curr"+curr.id+"+ td").text(formatNbr(curr.value));
                    }
                });
            });
        });
    });
}
// WALLET end
// BAGS start
function getBags() {
    resetView("bagStuff");
    $("#filterInp, #filter, #items").removeClass("hidden");
    $("#content").append($("<bagStuff/>").addClass("flexme"));
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
                $("bagStuff").append($("<div/>").addClass(account + " account").append($("<h2/>").append(accName)));
                getContent(key, account);
        });
    });

    $("#filterInp").focus();

    $("bagStuff").click(sortStuff);
}

function getContent(key, account) {
    $.getJSON(getURL("characters", key), function(data) {
        var charsDiv = $("<div/>").addClass("characters flexme");
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
        var itemsDiv = $("<div/>").addClass("stuff");
        var sharedBag = $("<div/>").addClass("sharedBag");
        charDiv.append($("<h4/>").text(character),
                       itemsDiv,
                       sharedBag
                       );
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
    });
}

function getBankData(key, account) {
    $.getJSON(getURL("account/bank", key), function(bankData) {
        var charDiv = $("<div/>").addClass("bank");
        var itemsDiv = $("<div/>").addClass("bankTabs");
        charDiv.append($("<span/>").text("Banque"),itemsDiv);
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
        charDiv.append($("<span/>").text("Matériaux"),itemsDiv);
        while (matsData.length) {
            getBag(matsData.splice(0, 150), itemsDiv);
        }
        $("." + account).append(charDiv);
    });
}

function getBag(bag, target) {
    var itemIDs = [];
    var skinIDs = [];
    var statIDs = [];
    for (var bagItem of bag) {
        if (bagItem) {
            if (!items.cache[bagItem.id] && itemsUnk.isStale(bagItem.id)) {
                itemIDs.push(bagItem.id);
            }
            if (bagItem.skin && !skins.cache[bagItem.skin] && skinsUnk.isStale(bagItem.skin)) {
                skinIDs.push(bagItem.skin);
            }
            if (bagItem.upgrades && !items.cache[bagItem.id] && itemsUnk.isStale(bagItem.id)) {
                itemIDs.push(bagItem.upgrades);
            }
            if (bagItem.infusions && !items.cache[bagItem.id] && itemsUnk.isStale(bagItem.id)) {
                itemIDs.push(bagItem.infusions);
            }
            if (bagItem.stats && !itemstats.cache[bagItem.stats.id] && itemstatsUnk.isStale(bagItem.stats.id)) {
                statIDs.push(bagItem.stats.id);
            }
        }
    };
    Promise.resolve()
    .then(loadItems.bind(this, skinIDs, "skins"))
    .then(loadItems.bind(this, itemIDs, "items"))
    .then(loadItems.bind(this, statIDs, "itemstats"))
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
                eval(type+"Unk").set(id, {});
            })
        }
    });
}

function updateBag(bag, target) {
    for (var bagItem of bag) {
        if (bagItem) {
            $.extend(true, bagItem, items.cache[bagItem.id]);
            if (bagItem.skin) {
                bagItem.default_skin = bagItem.name;
                bagItem.name = skins.cache[bagItem.skin].name;
                bagItem.icon = skins.cache[bagItem.skin].icon;
                JSON.stringify(skins.cache[bagItem.skin].flags).search("OverrideRarity") > 1 ? bagItem.rarity = skins.cache[bagItem.skin].rarity : null;
            }
            if (!bagItem.name) {
                bagItem = $.extend(true, {}, unkItem);
                bagItem.name += " [" + bagItem.id + "]";
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
        var bagItem = $.extend({}, emptySlot);
    }
    var itemSlot = $("<div/>").addClass("item" + " r_" + bagItem.rarity + " " + bagItem.type)
                              .addClass(bagItem.binding == "Account" ? "accBound" : null)
                              .addClass(bagItem.binding == "Character" ? "chaBound " + bagItem.bound_to : null)
                              .attr({
                                level: bagItem.level,
                                slot: bagItem.slot})
                              .html($("<img/>").attr({src: bagItem.icon}))
                              .data("name", (bagItem.name).toLowerCase());
    if (bagItem.count > 1) {
        itemSlot.append($("<span/>").text(formatNbr(bagItem.count)).addClass("count"));
    }
    else if (bagItem.count < 1) {
        itemSlot.addClass("r_Empty");
    }
    else if (bagItem.charges > 1) {
        itemSlot.append($("<span/>").text(formatNbr(bagItem.charges)).addClass("count charge"));
    }
    if (itemSlot.attr("type") != "Empty") {
        itemSlot.hover(function() {
            $("#toolTip").toggle();
        });
        itemSlot.mouseenter(function() {
            showToolTip(bagItem, itemSlot);
        });
    }
    return itemSlot;
}

function showToolTip(bagItem, itemSlot) {
    $("#toolTip").empty().append(
        $("<div/>").addClass(bagItem.rarity).text(bagItem.name).append(bagItem.level != 0 ? " ("+bagItem.level+")": null),
        $("<div/>").addClass("inactive").text(bagItem.skin ? bagItem.default_skin : null),
        bagItem.bound_to ? $("<div/>").text("Lié à : "+bagItem.bound_to) : null,
        bagItem.binding == "Account" ? $("<div/>").text("Lié au compte") : null,
        $.map([].concat(bagItem.upgrades,bagItem.infusions).filter(Number), function(upIt) {
            return createToolTipItem(items.cache[upIt]);
        })
    );
    var isPos = itemSlot.offset();
    $("#toolTip").css({
        "top": (isPos.top - $("#toolTip").height() - 6) + "px",
        "left": isPos.left + "px"
    });
}

function createToolTipItem(bagItem) {
    var itemSlot = $("<div/>").addClass("item tt" + " r_" + bagItem.rarity)
                      .html($("<img/>").attr({src: bagItem.icon}));
    bagItem.name.indexOf("+") > -1 ? itemSlot.append($("<span/>").text(bagItem.name.match(/(\+.*?)( |$)/)[1]).addClass("count")) : null;
    return itemSlot;
}

function sortStuff() {
    $("bagStuff").off();
    return $(".stuff").each(function() {
        $(this).append(
            $("<div/>").append(
                $("<div/>").append(
                    $(this).find("[slot=Helm]").length ? $(this).find("[slot=Helm]") : createBagItem(null),
                    $(this).find("[slot=Shoulders]").length ? $(this).find("[slot=Shoulders]") : createBagItem(null),
                    $(this).find("[slot=Coat]").length ? $(this).find("[slot=Coat]") : createBagItem(null),
                    $(this).find("[slot=Gloves]").length ? $(this).find("[slot=Gloves]") : createBagItem(null),
                    $(this).find("[slot=Leggings]").length ? $(this).find("[slot=Leggings]") : createBagItem(null),
                    $(this).find("[slot=Boots]").length ? $(this).find("[slot=Boots]") : createBagItem(null)).addClass("colo"),
                $("<div/>").append(
                    $(this).find("[slot=WeaponA1]").length ? $(this).find("[slot=WeaponA1]") : createBagItem(null),
                    $(this).find("[slot=WeaponA2]").length ? $(this).find("[slot=WeaponA2]") : createBagItem(null),
                    $(this).find("[slot=WeaponB1]").length ? $(this).find("[slot=WeaponB1]") : createBagItem(null),
                    $(this).find("[slot=WeaponB2]").length ? $(this).find("[slot=WeaponB2]") : createBagItem(null)).addClass("colo"),
                $("<div/>").append(
                    $(this).find("[slot=HelmAquatic]").length ? $(this).find("[slot=HelmAquatic]") : createBagItem(null),
                    $(this).find("[slot=WeaponAquaticA]").length ? $(this).find("[slot=WeaponAquaticA]") : createBagItem(null),
                    $(this).find("[slot=WeaponAquaticB]").length ? $(this).find("[slot=WeaponAquaticB]") : createBagItem(null)).addClass("colo"),
                $("<div/>").append(
                    $(this).find("[slot=Backpack]").length ? $(this).find("[slot=Backpack]") : createBagItem(null),
                    $(this).find("[slot=Accessory1]").length ? $(this).find("[slot=Accessory1]") : createBagItem(null),
                    $(this).find("[slot=Accessory2]").length ? $(this).find("[slot=Accessory2]") : createBagItem(null),
                    $(this).find("[slot=Amulet]").length ? $(this).find("[slot=Amulet]") : createBagItem(null),
                    $(this).find("[slot=Ring1]").length ? $(this).find("[slot=Ring1]") : createBagItem(null),
                    $(this).find("[slot=Ring2]").length ? $(this).find("[slot=Ring2]") : createBagItem(null)).addClass("colo")).addClass("flexme"),
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
    var filterValue = $("#filterInp").val().toLowerCase();
    var toHide = $("#items input:checkbox:not(:checked,.checkAll)").map(function() {
        return $(this).next("label").attr("class");
    }).get();
    $(".item:not(.tt)").each(function() {
        var itemLev = parseInt($(this).attr("level"));
        var name = $(this).data("name");
        var itemAttr = $(this).attr("class").slice(7).split(" ");
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
    $(".character, .bank, .mats").each(function() {
        if ($(this).find(".item:not(.hidden)").length == 0) {
            $(this).addClass("hidden");
        } else {
            $(this).removeClass("hidden");
        }
    });
    $(".account").each(function() {
        if ($(this).find(".item:not(.hidden)").length == 0) {
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
    $(".simpleFilter").removeClass("hidden");
    $("#content").append($("<table/>").prop("id","wardList").append($("<thead/>").append($("<tr/>").addClass("thead").append($("<td/>").addClass("thead"),$("<td/>").addClass("thead")))));
    // $("#content").append($("<table/>").prop("id","wardList").append($("<thead/>").append($("<tr/>").addClass("thead").append($("<td/>").addClass("thead"),
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
                    data[skin].description = data[skin].description ? data[skin].description.replace(/\"/g,'&quot;') : null;
                    $("#wardList").append($("<tr/>").attr({id: "skin" + data[skin].id}).data("name", data[skin].name.toLowerCase()).append(
                        $("<td/>").addClass("ico").html("<img src=\""+data[skin].icon+"\" title=\""+data[skin].description+"\">"),
                        $("<td/>").addClass("skinname "+data[skin].rarity).html("<a href=\""+searchURL+data[skin].name+" skin\">"+data[skin].name+"</a>")
                        ));
                    // $("#wardList").append($("<tr/>").attr({id: "skin" + data[skin].id}).data("name", data[skin].name.toLowerCase()).append(
                    //     $("<td/>").html("<img src=\""+data[skin].icon+"\" title=\""+data[skin].description+"\" style=\"width: 36px; margin-bottom:-5px;\">"),
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
                $("#wardList tr.thead td:last-of-type").after($("<td/>").addClass("accName").text(accName));
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
    $(".simpleFilter").removeClass("hidden");
    $("#content").append($("<table/>").prop("id","minisList").append($("<thead/>").append($("<tr/>").addClass("thead").append($("<td/>").addClass("thead"),$("<td/>").addClass("thead")))));
    var searchURL = "http://wiki.guildwars2.com/index.php?title=Special%3ASearch&go=Go&search=";
    $.getJSON(getURL("minis?ids=all"), function(data) {
        data.sort(function(a,b) {return a.order > b.order;});
        for(var mini in data) {
            data[mini].unlock = data[mini].unlock ? data[mini].unlock.replace(/\"/g,'&quot;') : null;
            $("#minisList").append($("<tr/>").attr({id: "mini" + data[mini].id}).data("name", data[mini].name.toLowerCase()).append(
                $("<td/>").addClass("ico").html("<img src=\""+data[mini].icon+"\" title=\""+data[mini].unlock+"\">"),
                $("<td/>").addClass("mininame").html("<a href=\""+searchURL+data[mini].item_id+"\">"+data[mini].name+"</a>")
                ));
        }
    });
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
            $.getJSON(getURL("account/minis", key), function(data) {
                $("#minisList tr.thead td:last-of-type").after($("<td/>").addClass("accName").text(accName));
                $("#minisList tr:not(.thead)  td:last-of-type").after($("<td/>").addClass(account).append($("<img/>").attr({src: icons["no"],alt: "0"}).addClass("yesno")));
                for(var id in data) {
                    $("#mini"+data[id]+" td."+account+" img").attr({src: icons["yes"],alt: "1"});
                }
            });
        });
    });
}
// MINIATURES end
// FINISHERS start
function getFinish() {
    resetView("finish");
    $(".simpleFilter").removeClass("hidden");
    $("#content").append($("<table/>").prop("id","finishList").append($("<thead/>").append($("<tr/>").addClass("thead").append($("<td/>").addClass("thead"),$("<td/>").addClass("thead")))));
    $.getJSON(getURL("finishers?ids=all"), function(data) {
        data.sort(function(a,b) {return a.order > b.order;});
        for(var finish in data) {
            data[finish].unlock = data[finish].unlock ? data[finish].unlock.replace(/\"/g,'&quot;') : null;
            $("#finishList").append($("<tr/>").attr({id: "finish" + data[finish].id}).data("name", data[finish].name.toLowerCase()).append(
                $("<td/>").addClass("ico").html("<img src=\""+data[finish].icon+"\" title=\""+data[finish].unlock+"\">"),
                $("<td/>").addClass("mininame").text(data[finish].name)
                ));
        }
    });
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
            $.getJSON(getURL("account/finishers", key), function(data) {
                $("#finishList tr.thead td:last-of-type").after($("<td/>").addClass("accName").text(accName));
                $("#finishList tr:not(.thead)  td:last-of-type").after($("<td/>").addClass(account).append($("<img/>").attr({src: icons["no"],alt: "0"}).addClass("yesno")));
                for(var id in data) {
                    if (typeof data[id].quantity === 'undefined') {
                        $("#finish"+data[id].id+" td."+account+" img").attr({src: icons["yes"],alt: "1"});
                    }
                }
            });
        });
    });
}
// FINISHERS end
// DYES start
function getDyes() {
    resetView("dyes");
    $(".simpleFilter").removeClass("hidden");
    $("#content").append($("<table/>").prop("id","dyeList").append($("<tr/>").addClass("thead").append($("<td/>").addClass("ico").prop("title","cloth"),$("<td/>").addClass("ico").prop("title","leather"),$("<td/>").addClass("ico").prop("title","metal"))));
    $(".thead td").each(function() {
        $(this).append($("<img/>").attr({src:icons[$(this).attr("title")],alt:$(this).attr("title")}));
    });
    $.getJSON(getURL("colors?ids=all"), function(data) {
        data.sort(function(a,b) {return a.name.localeCompare(b.name);});
        for(var dye in data) {
            $("#dyeList").append($("<tr/>").attr({id: "dye" + data[dye].id}).data("name", data[dye].name.toLowerCase()).data("cats", JSON.stringify(data[dye].categories).toLowerCase()).append($("<td/>").attr({colspan: "3", style: "background: -moz-linear-gradient(left, rgb(" + data[dye].cloth.rgb.join() + ") 33%, rgb(" + data[dye].leather.rgb.join() + ") 33%, rgb(" + data[dye].leather.rgb.join() + ") 66%, rgb(" + data[dye].metal.rgb.join() + ") 66%);text-shadow: 0px 0px 5px rgba(0, 0, 0, 1);"}).addClass("dyename").text(data[dye].name)));
        }
    });
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
            $.getJSON(getURL("account/dyes", key), function(data) {
                $("tr.thead td[title=metal]").after($("<td/>").addClass("accName").text(accName));
                $("#dyeList tr:not(.thead) .dyename").after($("<td/>").addClass(account).append($("<img/>").attr({src: icons["no"],alt: "0"}).addClass("yesno")));
                for(var id in data) {
                    $("#dye"+data[id]+" td."+account+" img").attr({src: icons["yes"],alt: "1"});
                }
            });
        });
    });
}
// DYES end
// TITLES start
function getTitles() {
    resetView("titles");
    $(".simpleFilter").removeClass("hidden");
    $("#content").append($("<table/>").prop("id","titleList").append($("<thead/>").append($("<tr/>").addClass("thead").append($("<td/>").addClass("thead")))));
    $.getJSON(getURL("titles?ids=all"), function(data) {
        data.sort(function(a,b){return a.name.localeCompare(b.name);})
        for(var title in data) {
            $("#titleList").append($("<tr/>").attr({id: "title" + data[title].id}).data("name", data[title].name.toLowerCase()).append(
                 // débloque par data[title].achivement
                $("<td/>").addClass("titlename").text(data[title].name)
                ));
        }
    });
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
            $.getJSON(getURL("account/titles", key), function(data) {
                $("#titleList tr.thead td:last-of-type").after($("<td/>").addClass("accName").text(accName));
                $("#titleList tr:not(.thead)  td:last-of-type").after($("<td/>").addClass(account).append($("<img/>").attr({src: icons["no"],alt: "0"}).addClass("yesno")));
                for(var id in data) {
                    $("#title"+data[id]+" td."+account+" img").attr({src: icons["yes"],alt: "1"});
                }
            });
        });
    });
}
// TITLES end
// RECIPES start
function getRecipes() {
    resetView("recipes");
    $("#content").text("WORK IN PROGRESS...");
}
// RECIPES end
// PVP start
function getPvP() {
    function getVic(json, what) {
        var vic;
        $.each(json, function(i, prof) {
            if (prof.id == what) {
                vic = prof.current;
            }
        });
        return vic
    }
    resetView("pvp");
    $("#content").append(
        $("<table/>").prop("id","pvpList").append(
            $("<thead/>").append($("<tr/>").addClass("thead").append($("<td/>").addClass("thead"))),
            $("<tr/>").addClass("id267 élémentaliste").append($("<td/>").text("Élémentaliste")),
            $("<tr/>").addClass("id270 envoûteur").append($("<td/>").text("Envoûteur")),
            $("<tr/>").addClass("id269 gardien").append($("<td/>").text("Gardien")),
            $("<tr/>").addClass("id274 guerrier").append($("<td/>").text("Guerrier")),
            $("<tr/>").addClass("id268 ingénieur").append($("<td/>").text("Ingénieur")),
            $("<tr/>").addClass("id271 nécromant").append($("<td/>").text("Nécromant")),
            $("<tr/>").addClass("id2181 revenant").append($("<td/>").text("Revenant")),
            $("<tr/>").addClass("id272 rôdeur").append($("<td/>").text("Rôdeur")),
            $("<tr/>").addClass("id273 voleur").append($("<td/>").text("Voleur"))
        )
    );
    // $.getJSON(getURL("professions?ids=all"), function(data) {
    //     var profList = [];
    //         profList = profList.concat(data.map(prof => prof.name)).sort(function(a,b){return a.localeCompare(b);});
    //     console.log(profList);
    // });
    $.getJSON(getURL("achievements/daily"), function(data) {
        var ids = [];
        ids = ids.concat(data.pvp.map(ach => ach.id));
        var done;
        $.getJSON(getURL("achievements?ids="+ids), function(dailyAch) {
            $.each(dailyAch, function(i, oneAch) {
                var color = (done ? "#673737": "#373767");
                var profs = oneAch.name.toLowerCase().split(" ");
                if (["élémentaliste","envoûteur","gardien","guerrier","ingénieur","nécromant","revenant","rôdeur","voleur"].indexOf(profs[0]) > -1) {
                    $("."+profs[0]+",."+profs[2]).css("background-color",color);
                    done=1;
                }
            });
        });
    });
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
            $.getJSON(getURL("account/achievements", key), function(data) {
                $("#pvpList tr.thead td:last-of-type").after($("<td/>").addClass("accName").text(accName));
                $("#pvpList tr:not(.thead)  td:last-of-type").after($("<td/>").addClass(account));
                [267,270,269,274,268,271,2181,272,273].forEach(function(ach) { $(".id"+ach+" td."+account).text(getVic(data, ach)); });
            });
        });
    });


        $("#pvpList").click(checkWin);

}
    function checkWin() {
        var tdCount = $('#pvpList tr:eq(0) td').length,
            trCount = $('#pvpList tr').length;

        $.each(["rgb(103, 55, 55)","rgb(55, 55, 103)"], function(i, color) {
            for (var i = 1; i < tdCount; i++) {
                var $td = $('#pvpList tr:eq(1) td:eq(' + i + ')'),
                    lowest = 9e99;

                for (var j = 2; j < trCount; j++) {
                    $td = $td.add('#pvpList tr:eq(' + j + ') td:eq(' + i + ')').filter(function() { return $(this).parent().css("background-color") == color; });
                }

                $td.each(function(i, el){
                    var $el = $(el);
                    if (i > -1) {
                        var valRed = parseInt($el.text(), 10);
                        if (valRed < lowest) {
                            lowest = valRed;
                            $td.removeClass('toPlay');
                            $el.addClass('toPlay');
                        }
                    }
                });
            }
        });
    }
// PVP end
// DAILY start
function getDaily(when) {
    function getLvl(json, what, which) {
        var lvl;
        $.each(json, function(i, dCat) {
            $.each(dCat, function(i, ach) {
                if (ach.id == what) {
                    if (which == 0) {
                        lvl = ach.level.min;
                    }
                    else if (which == 1) {
                        lvl = ach.level.max;
                    }
                    else if (which == 2) {
                        if (ach.required_access.length < 2) {
                            lvl = ach.required_access[0];
                        }
                    }
                }
            });
        });
        return lvl
    }
    resetView("daily");
    $("#content").append($("<table/>").prop("id","dailyList"));
    switch(when) {
        case "today": var url = getURL("achievements/daily"); break;
        case "tomorrow": var url = getURL("achievements/daily/tomorrow");
    }
    $.getJSON(url, function(data) {
        var ids = [];
        var levels = [];
        $.each(data, function(i, dCat) {
            ids = ids.concat(dCat.map(ach => ach.id));
            // levels = levels.concat(dCat.map(ach => "\""+ach.id+"\":{\"min\":"+ach.level.min+",\"max\":"+ach.level.max+"}"));
        });
        $.getJSON(getURL("achievements?ids="+ids), function(dailyAch) {
            var dummy=88;
            $.each(dailyAch, function(i, oneAch) {
                oneIcon = oneAch.icon ? oneAch.icon : icons["dailypve"];
                oneAch.description = oneAch.description ? oneAch.description.replace(/\"/g,'&quot;') : null;
                $("#dailyList").append($("<tr/>").append(
                "<td title=\""+oneAch.id+"\"><img src=\""+oneIcon+"\"></td>",
                "<td title=\""+oneAch.description+"\">"+oneAch.name+"</td>",
                "<td>"+oneAch.requirement+"</td>",
                "<td width=\"60\">"+getLvl(data, oneAch.id, 0)+"<br>"+getLvl(data, oneAch.id, 1)+"</td>"
                ).addClass(getLvl(data, oneAch.id, 2)));
            });
        });
    });
}
// DAILY end
