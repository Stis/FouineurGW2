location.hash ? window.location.replace("") : "";

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
var guids = JSON.parse(localStorage.getItem("guids") || "[]");
var guilds = Object.create(Cache).init({ key: "guildCache", ttl: 5 * 60 * 1000 });
var items = Object.create(Cache).init({ key: "itemCache" });
var itemsUnk = Object.create(Cache).init({ key: "itemUnkCache", ttl: 24 * 60 * 60 * 1000 });
var itemstats = Object.create(Cache).init({ key: "itemstatCache" });
var itemstatsUnk = Object.create(Cache).init({ key: "itemstatUnkCache", ttl: 24 * 60 * 60 * 1000 });
var skins = Object.create(Cache).init({ key: "skinCache" });
var skinsUnk = Object.create(Cache).init({ key: "skinUnkCache", ttl: 24 * 60 * 60 * 1000 });
var emptySlot = {
  icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNiYAAAAAkAAxkR2eQAAAAASUVORK5CYII=",
  name: "Slot vide",
  rarity: "Empty",
  level: "0",
  type: "Empty"
};
var unkItem = {
  icon: "img/nonidentifie.png",
  name: "Objet non identifié",
  rarity: "Unknown",
  level: "0",
  type: "Unknown"
};

function icony(what) {
  return "img/"+what+".png";
}

function formatDate(t) {
  return new Date(t).toLocaleDateString();
}

function formatNbr(n) {
  return new Intl.NumberFormat().format(n);
}

function formatPognon(n) {
  return n.replace(/(\d+?)(\d{2})(\d{2})$/, "$1"+" "+"$2"+" "+"$3");
}

function getURL(eP, key) {
  var url = "https://api.guildwars2.com/v2/"+eP;
  key ? url += "?access_token="+key : "";
  return url;
}

function buildVer() {
  $.getJSON(getURL("build"), function(buildD) {
    $("#build").text(buildD.id);
  }).fail(noAPI);
}

function noAPI() {
  alert("L\'API semble inaccessible\n\nAPI seems unattainable");
}

$(window).on("load", function() {
  buildVer();
  $("#chars label").each(function() {
    $(this).prepend($("<img/>", {src: icony($(this).attr("class")), alt: $(this).attr("class"), title: $(this).attr("class")}));
  });
  if (guids) {
    $.each(guids, function() {
      $("#keyList").append(this+"\n");
    });
    $("#keyList").html($("#keyList").val().replace(/\n$/, ""));
  }
  $("#title").click(function() {location.reload();});
  $("#saveKeys").click(function() {
    localStorage.setItem("guids", JSON.stringify($("#keyList").val().split(/\n| |,/)));
  });
  $("#delKeys").click(function() {
    localStorage.removeItem("guids");
    $("#keyList").empty();
  });
  $("#keyList").each(function () {
    this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
  }).on("input", function () {
    this.style.height = 0;
    this.style.height = (this.scrollHeight) + "px";
  });
  $("#menu").hover(function() {
    $("#menuPop").toggle();
  });
  $("#filterInp").keyup(itemFilter);
  $("#filter").hover(function() {
    $("#filterPop").toggle();
  });
  $(".checkAll").change(function() {
    $("input:checkbox."+$(this).attr("ctrl")).prop("checked", $(this).prop("checked"));
    var filt = $(this).attr("ctrl");
    if (filt == "rarity" || filt == "type" || filt =="binding") {
      itemFilter();
    } else {
      charFilter();
    }
  });
  $(".rarity, .type, .binding").change(itemFilter);
  $(".gender, .race, .prof").change(charFilter);
  $("#items .levFilter").keyup(itemFilter);
  $("#chars .levFilter").keyup(charFilter);
  $(".simpleFilter").keyup(function() {simpleFilter($(this));});
  $("[id^=get]").click(function() {eval(this.id+"(\""+this.className+"\")");});
  $("#build").click(buildVer);
});

function resetView(who) {
  window.location.replace("#"+who);
  $("#content").empty();
  $("input[type=text]").val("");
  $("input:checkbox").prop("checked", true);
  $(".simpleFilter, #filterInp, #filter, #items, #chars").addClass("hidden");
}

function simpleFilter(who) {
  var filterValue = who.val().toLowerCase();
  $("tbody tr").each(function() {
    var name = $(this).data("name");
    if (name.indexOf(filterValue) < 0) {
      $(this).addClass("hidden");
    } else {
      $(this).removeClass("hidden");
    }
  });
}

function getAchievement() {
  resetView("Achievement");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "achievList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("achievements")).done(function (ids) {
    var achParts = [];
    for (var i=0; i<ids.length; i+=200) {
      var current_ids = ids.slice(i,i+200).join(',');
      var achPart = $.getJSON(getURL("achievements?ids="+current_ids));
      achParts.push(achPart);
    }
    $.when.apply($,achParts).done(function() {
      var data = [];
      $.each(arguments, function(i, element){
        $.each(element[0], function(i, val){
          data.push(val);
        });
      });
      $.each(data, function(i, row) {
        row["description"] = row["description"] ? row["description"].replace(/\"/g,'&quot;') : "";
        row["icon"] ? "" : row["icon"]=icony("undefined");
        $("tbody").append($("<tr/>", {id: "achiev"+row["id"]}).data("name", row["name"].toLowerCase()).append(
          $("<td/>").html("<img src=\""+row["icon"]+"\" title=\""+row["description"]+"\">"),
          $("<td/>", {class: "group"}),
          $("<td/>", {class: "category"}),
          $("<td/>", {class: "achievname"}).html("<span class=\"excel\"></span>"+row["name"])
        ));
      });
    }).then(function() {
      $.getJSON(getURL("achievements/categories?ids=all"), function(data) {
        for (var catList in data) {
          for (var achID in data[catList].achievements) {
            $("#achiev"+data[catList].achievements[achID]+" .category").attr({title: data[catList].description}).text(data[catList].name);
            $("#achiev"+data[catList].achievements[achID]+" .excel").append(data[catList].order.toString().padStart(3, "0"));
            $("#achiev"+data[catList].achievements[achID]).addClass("cat"+data[catList].id);
          }
        }
      });
    }).then(function() {
      $.getJSON(getURL("achievements/groups?ids=all"), function(data) {
        for (var groupList in data) {
          for (var catID in data[groupList].categories) {
            $(".cat"+data[groupList].categories[catID]+" .group").attr({title: data[groupList].description}).text(data[groupList].name);
            $(".cat"+data[groupList].categories[catID]+" .excel").prepend(data[groupList].order.toString().padStart(2, "0"));
          }
        }
      });
    }).then(function() {
      // AJAX OFF start
      jQuery.ajaxSetup({async:false});
      $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(accountD) {
          var accName = accountD.name;
          var account = accountD.name.replace(/\s|\./g,"");
          $.getJSON(getURL("account/achievements", key), function(data) {
            $("thead td:last-of-type").after($("<td/>", {text: accName}));
            $("tbody td:last-of-type").after($("<td/>", {class: account}));
            for(var ach in data) {
              if (data[ach].done === true) {
                $("#achiev"+data[ach].id+" td."+account).text("Fini");
              } else {
                $("#achiev"+data[ach].id+" td."+account).text(Math.trunc(data[ach].current/data[ach].max*100)+"%");
              }
              data[ach].repeated ? $("#achiev"+data[ach].id+" td."+account).append(" ("+data[ach].repeated+")") : "";
            }
          });
        });
      });
      jQuery.ajaxSetup({async:true});
      // AJAX OFF end
      // SANS AJAX start
      //var accParts = [];
      //$.each(guids, function(i, key) {
      //  var accPart = $.getJSON(getURL("account", key));
      //    accParts.push(accPart);
      //});
      //$.when.apply($,accParts).done(function() {
      //  var accNames = [];
      //  var accounts = [];
      //  $.each(arguments, function(i, acc){
      //    accNames.push(acc[0].name);
      //    accounts.push(acc[0].name.replace(/\s|\./g,""));
      //  });
      //});
      // SANS AJAX end
    });
  });
}

function getCat() {
  resetView("Cat");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "catList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("home/cats?ids=all"), function(catsD) {
    for(i in catsD) {
      $("#catList tbody").append($("<tr/>", {id: "cat"+catsD[i].id}).data("name", catsD[i].hint.toLowerCase().replace(/_/g, ' ')).append(
        $("<td/>", {class: "catname", text: catsD[i].hint.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())})
      ));
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/home/cats", key), function(aCatsD) {
        $("thead td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
        for(i in aCatsD) {
          $("#cat"+aCatsD[i].id+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
        }
      });
    });
  });
}

function getCharacter() {
  resetView("Character");
  $("#filter, #chars").removeClass("hidden");
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      $.getJSON(getURL("worlds/"+accountD.world), function(worldD) {
        var account = accountD.name.replace(/\s|\./g,"");
        var typAcc = accountD.access;
        var accessIcons = $("<span/>").append($("<img/>", {src: icony("GuildWars2"), class: "icon", alt: "Guild Wars 2", title: "Guild Wars 2"}));
        if (typAcc.indexOf("HeartOfThorns")+1) {accessIcons.append($("<img/>", {src: icony("HeartOfThorns"), class: "icon", alt: "Heart Of Thorns", title: "Heart Of Thorns"}));}
        if (typAcc.indexOf("PathOfFire")+1) {accessIcons.append($("<img/>", {src: icony("PathOfFire"), class: "icon", alt: "Path Of Fire", title: "Path Of Fire"}));}
        if (typAcc.indexOf("EndOfDragons")+1) {accessIcons.append($("<img/>", {src: icony("EndOfDragons"), class: "icon", alt: "End Of Dragons", title: "End Of Dragons"}));}
        if (typAcc.indexOf("SecretsOfTheObscure")+1) {accessIcons.append($("<img/>", {src: icony("SecretsOfTheObscure"), class: "icon", alt: "Secrets Of The Obscure", title: "Secrets Of The Obscure"}));}
        if (typAcc == "PlayForFree") {accessIcons.html($("<img/>", {src: icony("PlayForFree"), class: "icon", alt: "GW2 Play for Free", title: "GW2 Play for Free"}));}
        $("#content").append(
          $("<div/>", {class: account+" acc"}).append(
            accountD.commander ? $("<img/>", {class: "icon", src: icony("Commander"), alt: "Commandant", title: "Commandant"}) : "",
            $("<h2/>", {text: accountD.name, title: "Créé le "+formatDate(accountD.created)}),
            $("<h4/>", {class: "server", text: worldD.name}),
            accessIcons," - ",
            $("<span/>", {class: "fractlev"}).append($("<img/>", {src: icony("FractalLevel"), class: "icon", alt: "Niveau de fractales", title: "Niveau de fractales"}), accountD.fractal_level)," - ",
            $("<span/>", {class: "wvwrank"}).append($("<img/>", {src: icony("WvWRank"), class: "icon", alt: "Rang McM", title: "Rang McM"}), formatNbr(accountD.wvw_rank))," - ",
            $("<span/>", {class: "pvprank"}).append($("<img/>", {src: icony("PvPRank"), class: "icon", alt: "Rang JcJ", title: "Rang JcJ"}), $.getJSON(getURL("pvp/stats", key), function(pvpstatsD) {$("."+account+" .pvprank").append(pvpstatsD.pvp_rank)})),
            $("<div/>", {class: "characters flexme"})
          )
        );
        $.getJSON(getURL("characters", key), function(charsListD) {
          $.each(charsListD, function(i, charName) {
            $.getJSON(getURL("characters/"+charName+"/core", key), function(charCoreD) {
              $.getJSON(getURL("characters/"+charName+"/crafting", key), function(charCraftD) {
                var charDiv = $("<div/>", {class: "character"+" "+charCoreD.race+" "+charCoreD.profession+" "+charCoreD.gender, level: charCoreD.level});
                $("."+account+" .characters").append(charDiv);
                charDiv.append(
                  $("<div/>", {class: "name", text: charName}),
                  $("<div/>", {class: "title"}),
                  charCoreD.title ? $.getJSON(getURL("titles/"+charCoreD.title), function(titlesD) {charDiv.children(".title").text(titlesD.name)})
                    .fail(function() {charDiv.children(".title").text("<i>- non trouvé -</i>")}) : "",
                  $("<div/>", {class: "bio"}),
                  $.getJSON(getURL("characters/"+charName+"/backstory", key), function(charBacksD) {
                    $.getJSON(getURL("backstory/answers?ids="+JSON.stringify(charBacksD.backstory).replace(/\[|\]|\"/g,"")), function(backstoryD) {
                      $.each(backstoryD, function(i, answer) {
                        charDiv.children(".bio").append($("<img/>", {src: icony("bio/"+answer.id), class: "icon", alt: answer.title, title: answer.title}));
                  })})}),
                  $("<div/>", {class: "spec"}).append(
                    $("<img/>", {src: icony("Birthday"), class: "icon"}), formatDate(charCoreD.created),
                    "<br>",
                    $("<img/>", {src: icony(charCoreD.race), class: "icon "+charCoreD.race, alt: charCoreD.race, title: charCoreD.race }),
                    $("<img/>", {src: icony(charCoreD.gender), class: "icon "+charCoreD.gender, alt: charCoreD.gender, title: charCoreD.gender }),
                    $("<img/>", {src: icony(charCoreD.profession), class: "icon "+charCoreD.profession, alt: charCoreD.profession, title: charCoreD.profession }),
                    charCoreD.level,
                    "<br>", $("<img/>", {src: icony("Deaths"), class: "icon "}), formatNbr(charCoreD.deaths),
                    $.map(charCraftD.crafting, function(disci) {
                      return $("<div/>", {class: disci.active ? "" : "inactive"}).append($("<img/>", {src: icony(disci.discipline), class: "icon "+disci.discipline, alt: disci.discipline, title: disci.discipline}), disci.rating);
                    })
                  )
                );
                var guildId = charCoreD.guild;
                if (guildId) {
                  function insertGuildIntoPage(guildD) {
                    charDiv.children("div.name").append(" ["+guildD.tag+"]");
                    charDiv.append($("<img/>", {class: "charBg", src: "http://guilds.gw2w2w.com/"+guildId+".svg"}));
                  }
                  if (guilds.isStale(guildId)) {
                    $.getJSON(getURL("guild/"+guildId), function(guildD) {
                      guilds.set(guildId, guildD);
                      insertGuildIntoPage(guildD);
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

function charFilter() {
  var levCMin = ($("#levCMin").val() == "") ? 1 : parseInt($("#levCMin").val());
  var levCMax = ($("#levCMax").val() == "") ? 80 : parseInt($("#levCMax").val());
  var toHide = $("#chars input:checkbox:not(:checked, .checkAll)").map(function() {
    return $(this).next("label").attr("class");
  }).get();
  $(".character").each(function() {
    var charLev = parseInt($(this).attr("level"));
    var charAttr = $(this).attr("class").split(" ").slice(1);
    if (levCMin > charLev || charLev > levCMax || charAttr.some(function(x) {return toHide.indexOf(x) > -1;})) {
      $(this).addClass("hidden");
    } else {
      $(this).removeClass("hidden");
    }
  });
}

function getDaily(when) {
  resetView("Daily"+when);
  $("#content").append($("<table/>", {id: "dailyList"}));
  $.getJSON(getURL("achievements/daily"+when), function(dailyD) {
    var ids = [];
    var levels = {};
    var rests = {};
    $.each(dailyD, function(i, dCat) {
      $.each(dCat, function(i, dAch) {
        ids.push(dAch.id);
        levels[dAch.id]={min: dAch.level.min, max: dAch.level.max};
        if (dAch.required_access.length < 2) {
          rests[dAch.id]=dAch.required_access[0];
        }
      });
    });
    $.getJSON(getURL("achievements?ids="+ids), function(dailyAchD) {
      $.each(dailyAchD, function(i, dAAch) {
        dAAch.icon = dAAch.icon ? dAAch.icon : icony("quotijce");
        dAAch.description = dAAch.description ? dAAch.description.replace(/\"/g,'&quot;') : "";
        $("#dailyList").append($("<tr/>", {class: rests[dAAch.id]}).append(
          "<td title=\""+dAAch.id+"\"><img src=\""+dAAch.icon+"\"></td>",
          "<td title=\""+dAAch.description+"\">"+dAAch.name+"</td>",
          "<td>"+dAAch.requirement+"</td>",
          "<td width=\"60\">"+levels[dAAch.id].min+"<br>"+levels[dAAch.id].max+"</td>"
        ));
      });
    });
  });
}

function getDye() {
  resetView("Dye");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "dyeList"}).append($("<thead/>").append($("<tr/>").append($("<td/>", {title: "Tissu"}), $("<td/>", {title: "Cuir"}), $("<td/>", {title: "Metal"}))), $("<tbody/>")));
  $("thead td").each(function() {
    $(this).append($("<img/>", {src: icony($(this).attr("title")), alt: $(this).attr("title")}));
  });
  $.getJSON(getURL("colors?ids=all"), function(colorsD) {
    colorsD.sort(function(a,b) {return a.name.localeCompare(b.name);});
    for(i in colorsD) {
      $("#dyeList tbody").append($("<tr/>", {id: "dye"+colorsD[i].id}).data("name", colorsD[i].name.toLowerCase()).data("cats", JSON.stringify(colorsD[i].categories).toLowerCase()).append($("<td/>", {colspan: "3", style: "background: -moz-linear-gradient(left, rgb("+colorsD[i].cloth.rgb.join()+") 33%, rgb("+colorsD[i].leather.rgb.join()+") 33%, rgb("+colorsD[i].leather.rgb.join()+") 66%, rgb("+colorsD[i].metal.rgb.join()+") 66%);text-shadow: 0px 0px 5px rgba(0, 0, 0, 1);", class: "dyename", text: colorsD[i].name})));
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/dyes", key), function(aDyesD) {
        $("thead tr td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody tr td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
        for(i in aDyesD) {
          $("#dye"+aDyesD[i]+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
        }
      });
    });
  });
}

function getFinisher() {
  resetView("Finisher");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "finishList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"), $("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("finishers?ids=all"), function(finishersD) {
    finishersD.sort(function(a,b) {return a.order > b.order;});
    for(i in finishersD) {
      finishersD[i].unlock_details = finishersD[i].unlock_details ? finishersD[i].unlock_details.replace(/\"/g,'&quot;') : "";
      $("#finishList tbody").append($("<tr/>", {id: "finish"+finishersD[i].id}).data("name", finishersD[i].name.toLowerCase()).append(
        $("<td/>", {html: $("<img/>", {src: finishersD[i].icon, title: finishersD[i].unlock_details})}),
        $("<td/>", {class: "finishname", text: finishersD[i].name})
      ));
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/finishers", key), function(aFinishersD) {
        $("thead tr td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody tr td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
        for(i in aFinishersD) {
          if (aFinishersD[i].permanent = true) {
            $("#finish"+aFinishersD[i].id+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
          }
        }
      });
    });
  });
}

function getGlider() {
  resetView("Glider");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "gliderList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"), $("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("gliders?ids=all"), function(glidersD) {
    glidersD.sort(function(a,b) {return a.order > b.order;});
    for(i in glidersD) {
      glidersD[i].description = glidersD[i].description ? glidersD[i].description.replace(/\"/g,'&quot;') : "";
      $("#gliderList tbody").append($("<tr/>", {id: "glider"+glidersD[i].id}).data("name", glidersD[i].name.toLowerCase()).append(
        $("<td/>", {html: $("<img/>", {src: glidersD[i].icon, title: glidersD[i].description})}),
        $("<td/>", {class: "glidername", text: glidersD[i].name})
      ));
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/gliders", key), function(aGlidersD) {
        $("thead tr td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody tr td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
        for(i in aGlidersD) {
          $("#glider"+aGlidersD[i]+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
        }
      });
    });
  });
}

function getJournal() {
  resetView("Journal");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "questList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"), $("<td/>")),$("<tr/>").append($("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("quests")).done(function (ids) {
    var questParts = [];
    for (var i=0; i<ids.length; i+=200) {
      var current_ids = ids.slice(i,i+200).join(',');
      var questPart = $.getJSON(getURL("quests?ids="+current_ids));
      questParts.push(questPart);
    }
    $.when.apply($,questParts).done(function() {
      var data = [];
      $.each(arguments, function(i, element){
        $.each(element[0], function(i, val){
          data.push(val);
        });
      });
      $.each(data, function(i, row) {
        $("tbody").append($("<tr/>", {id: "quest"+row["id"], class: "story"+row["story"]}).data("name", row["name"].toLowerCase()).append(
          $("<td/>", {class: "race"}),
          $("<td/>", {class: "level"}).html(row["level"]),
          $("<td/>", {class: "season"}),
          $("<td/>", {class: "story"}),
          $("<td/>", {class: "questname"}).html("<span class=\"excel\"></span>"+row["name"])
        ));
      });
    }).then(function() {
      $.getJSON(getURL("stories?ids=all"), function(data) {
        for (var storyList in data) {
            data[storyList].races ? $(".story"+data[storyList].id+" .race").append($("<label/>").addClass(data[storyList].races[0])) : "";
            $(".story"+data[storyList].id+" .story").attr({title: data[storyList].description}).text(data[storyList].name);
            $(".story"+data[storyList].id+" .excel").append(data[storyList].order.toString().padStart(3, "0"));
        }
      });
    }).then(function() {
      $.getJSON(getURL("stories/seasons?ids=all"), function(data) {
        for (var seasonList in data) {
          for (var storyID in data[seasonList].stories) {
            $(".story"+data[seasonList].stories[storyID]+" .season").text(data[seasonList].name);
            $(".story"+data[seasonList].stories[storyID]+" .excel").prepend(data[seasonList].order.toString().padStart(3, "0"));
          }
        }
      });
    }).then(function() {
      // AJAX OFF start
      jQuery.ajaxSetup({async:false});
      $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(accountD) {
          var accName = accountD.name;
          var account = accountD.name.replace(/\s|\./g,"");
          $.getJSON(getURL("characters", key), function(charsList) {
            $("thead tr:first-of-type td:last-of-type").after($("<td/>", {text: accName, colspan: charsList.length}));
            charsList.sort();
            for(i in charsList) {
              $("thead tr:last-of-type td:last-of-type").after($("<td/>", {text: charsList[i], class: account}));
              $("tbody tr td:last-of-type").after($("<td/>", {class: charsList[i].replaceAll(/ /g, "_")}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
              $.getJSON(getURL("characters/"+charsList[i]+"/quests",key), function(questsList) {
                for (j in questsList) {
                  $("#quest"+questsList[j]+" td."+charsList[i].replaceAll(/ /g, "_")+" img").attr({src: icony("yes"), alt: "1"});
                }
              });
            }
          });
        });
      });
      jQuery.ajaxSetup({async:true});
      // AJAX OFF end
      $(".race label").each(function() {
        $(this).prepend($("<img/>", {src: icony($(this).attr("class")), alt: $(this).attr("class"), title: $(this).attr("class")}));
      });
    });
  });
}

function getMailcarrier() {
  resetView("Mailcarrier");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "mailCarrierList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"), $("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("mailcarriers?ids=all"), function(mailCarriersD) {
    mailCarriersD.sort(function(a,b) {return a.order > b.order;});
    for(i in mailCarriersD) {
      $("#mailCarrierList tbody").append($("<tr/>", {id: "mailCarrier"+mailCarriersD[i].id}).data("name", mailCarriersD[i].name.toLowerCase()).append(
        $("<td/>", {html: $("<img/>", {src: mailCarriersD[i].icon})}),
        $("<td/>", {class: "mailcarriername", text: mailCarriersD[i].name})
      ));
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/mailcarriers", key), function(aMailCarriersD) {
        $("thead tr td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody tr td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
        for(i in aMailCarriersD) {
          $("#mailCarrier"+aMailCarriersD[i]+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
        }
      });
    });
  });
}

function getMiniature() {
  resetView("Miniature");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "miniList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"), $("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("minis?ids=all"), function(minisD) {
    minisD.sort(function(a,b) {return a.order > b.order;});
    for(i in minisD) {
      minisD[i].unlock = minisD[i].unlock ? minisD[i].unlock.replace(/\"/g,'&quot;') : "";
      $("#miniList tbody").append($("<tr/>", {id: "mini"+minisD[i].id}).data("name", minisD[i].name.toLowerCase()).append(
        $("<td/>", {html: $("<img/>", {src: minisD[i].icon, title: minisD[i].unlock})}),
        $("<td/>", {class: "mininame", text: minisD[i].name})
      ));
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/minis", key), function(aMinisD) {
        $("thead tr td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody tr td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
        for(i in aMinisD) {
          $("#mini"+aMinisD[i]+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
        }
      });
    });
  });
}

function getMistsChampion() {
  resetView("MistsChampion");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "champList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"), $("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("pvp/heroes?ids=all"), function(heroesD) {
    for(i in heroesD) {
      heroesD[i].description = heroesD[i].description ? heroesD[i].description.replace(/\"/g,'&quot;') : "";
      for (j in heroesD[i].skins) {
        $("#champList tbody").append($("<tr/>", {id: "hero"+heroesD[i].skins[j].id}).data("name", heroesD[i].skins[j].name.toLowerCase()).append(
        $("<td/>", {html: $("<img/>", {src: heroesD[i].skins[j].icon, title: heroesD[i].description})}),
        $("<td/>", {class: "heroname", text: heroesD[i].skins[j].name})
        ));
      }
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/pvp/heroes", key), function(aHeroesD) {
        $("thead td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
        for(i in aHeroesD) {
          $("#hero"+aHeroesD[i]+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
        }
      });
    });
  });
}

function getMount() {
  resetView("Mount");
  $(".simpleFilter").removeClass("hidden"); // filtre par type
  $("#content").append($("<table/>", {id: "mountList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"), $("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("mounts/skins?ids=all"), function(mountsD) {
    mountsD.sort(function(a,b) {return a.order > b.order;});
    for(i in mountsD) {
      mountsD[i].description = mountsD[i].description ? mountsD[i].description.replace(/\"/g,'&quot;') : "";
      $("#mountList tbody").append($("<tr/>", {id: "mount"+mountsD[i].id}).data("name", mountsD[i].name.toLowerCase()).append(
        $("<td/>", {html: $("<img/>", {src: mountsD[i].icon, title: mountsD[i].description})}),
        $("<td/>", {class: "mountname", text: mountsD[i].name})
      ));
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/mounts/skins", key), function(aMountsD) {
        $("thead tr td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody tr td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
        for(i in aMountsD) {
          $("#mailCarrier"+aMountsD[i]+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
        }
      });
    });
  });
}

function getNode() {
  resetView("Node");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "nodeList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("home/nodes?ids=all"), function(nodesD) {
    for(i in nodesD) {
      $("#nodeList tbody").append($("<tr/>", {id: "node"+nodesD[i].id}).data("name", nodesD[i].id.toLowerCase().replace(/_/g, ' ')).append(
        $("<td/>", {class: "nodename", text: nodesD[i].id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())})
      ));
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/home/nodes", key), function(aNodesD) {
        $("thead tr td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody tr td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
        for(i in aNodesD) {
          $("#node"+aNodesD[i]+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
        }
      });
    });
  });
}

function getOutfit() {
  resetView("Outfit");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "outfitList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"), $("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("outfits?ids=all"), function(outfitsD) {
    outfitsD.sort(function(a,b) {return a.name.localeCompare(b.name);});
    for(i in outfitsD) {
      $("#outfitList tbody").append($("<tr/>", {id: "outfit"+outfitsD[i].id}).data("name", outfitsD[i].name.toLowerCase()).append(
        $("<td/>", {html: $("<img/>", {src: outfitsD[i].icon})}),
        $("<td/>", {class: "outfitname", text: outfitsD[i].name})
      ));
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/outfits", key), function(aOutfitsD) {
        $("thead tr td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody tr td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
        for(i in aOutfitsD) {
          $("#outfit"+aOutfitsD[i]+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
        }
      });
    });
  });
}

function getPvP() {
  resetView("PvP");
  $("#content").append(
    $("<table/>", {id: "pvpList"}).append(
      $("<thead/>").append($("<tr/>").append($("<td/>"))),
      $("<tbody/>").append(
        $("<tr/>", {class: "id267"}).append($("<td/>", {text: "Élémentaliste"})),
        $("<tr/>", {class: "id270"}).append($("<td/>", {text: "Envoûteur"})),
        $("<tr/>", {class: "id269"}).append($("<td/>", {text: "Gardien"})),
        $("<tr/>", {class: "id274"}).append($("<td/>", {text: "Guerrier"})),
        $("<tr/>", {class: "id268"}).append($("<td/>", {text: "Ingénieur"})),
        $("<tr/>", {class: "id271"}).append($("<td/>", {text: "Nécromant"})),
        $("<tr/>", {class: "id2181"}).append($("<td/>", {text: "Revenant"})),
        $("<tr/>", {class: "id272"}).append($("<td/>", {text: "Rôdeur"})),
        $("<tr/>", {class: "id273"}).append($("<td/>", {text: "Voleur"}))
      )
    )
  );
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/achievements?ids=267,270,269,274,268,271,2181,272,273&access_token="+key), function(aAchsD) {
        $("thead tr td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody tr td:last-of-type").after($("<td/>", {class: account}));
        for (i in aAchsD) {
          $(".id"+aAchsD[i].id+" td."+account).text(aAchsD[i].current);
        }
      });
    });
  });
  $("#pvpList").click(checkWin);
}
function checkWin() {
  var tdCount = $('#pvpList tr:eq(0) td').length,
      trCount = $('#pvpList tr').length;
  for (var i = 1; i < tdCount; i++) {
    var $td = $('#pvpList tr:eq(1) td:eq('+i+')'),
        lowest = 9e99;
    for (var j = 2; j < trCount; j++) {
      $td = $td.add('#pvpList tr:eq('+j+') td:eq('+i+')');
    }
    $td.each(function(i, el) {
      var $el = $(el);
      if (i > -1) {
        var current = parseInt($el.text(), 10);
        if (current < lowest) {
          lowest = current;
          $td.removeClass('toPlay');
          $el.addClass('toPlay');
        }
      }
    });
  }
}

function getStuff() {
    resetView("Stuff");
    $("#filterInp, #filter, #items").removeClass("hidden");
    $("#content").append($("<allStuff/>", {class: "flexme"}));
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(data) {
            var accName = data.name;
            var account = data.name.replace(/\s|\./g,"");
                $("allStuff").append($("<div/>", {class: account+" account"}).append($("<h2/>", {text: accName})));
                getContent(key, account);
        });
    });

    $("#filterInp").focus();

    $("allStuff").click(sortStuff);
}

function getContent(key, account) {
    $.getJSON(getURL("characters", key), function(charsListD) {
        var charsDiv = $("<div/>", {class: "characters flexme"});
        $("."+account).append(charsDiv);
        $.each(charsListD, function(i, charName) {
            getCharData(charName, key, account);
        });
        getBankData(key, account);
        getMatsData(key, account);
    });
}

function getCharData(character, key, account) {
    var charDiv = $("<div/>", {class: "character"});
    var stuffDiv = $("<div/>", {class: "stuff"});
    var sharedBag = $("<div/>", {class: "sharedBag"});
    $("."+account+" .characters").append(charDiv.append($("<h4/>", {text: character}),stuffDiv,sharedBag));
    $.getJSON(getURL("characters/"+character, key), function(charData) {
        getBag(charData.equipment, stuffDiv);
        $.each(charData.bags, function(i, bag) {
            if (!bag) { return; }
            var oneBag = $("<span/>", {class: "bag"});
            charDiv.append(oneBag);
            getBag(bag.inventory, oneBag);
        });
    });
    $.getJSON(getURL("account/inventory", key), function(sharedBagData) {
        getBag(sharedBagData, sharedBag);
    });
}

function getBankData(key, account) {
    $.getJSON(getURL("account/bank", key), function(bankData) {
        var charDiv = $("<div/>", {class: "bank"});
        var bankDiv = $("<div/>", {class: "bankTabs"});
        charDiv.append($("<span/>", {text: "Banque"}), bankDiv);
        while (bankData.length) {
            getBag(bankData.splice(0, 150), bankDiv);
        }
        $("."+account).append(charDiv);
    });
}

function getMatsData(key, account) {
    $.getJSON(getURL("account/materials", key), function(matsData) {
        var charDiv = $("<div/>", {class: "mats"});
        var matsDiv = $("<div/>", {class: "matsTabs"});
        charDiv.append($("<span/>", {text: "Matériaux"}), matsDiv);
        while (matsData.length) {
            getBag(matsData.splice(0, 150), matsDiv);
        }
        $("."+account).append(charDiv);
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
    return $.getJSON(getURL(type+"?ids="+ids.join(",")), function(data) {
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
                skins.cache[bagItem.skin].flags.indexOf("OverrideRarity") > 0 ? bagItem.rarity = skins.cache[bagItem.skin].rarity : "";
            }
            if (!bagItem.name) {
                bagItem = $.extend(true, bagItem, unkItem);
                bagItem.name += " ["+bagItem.id+"]";
            }
            target.append(createBagItem(bagItem));
        } else {
            target.append(createBagItem(null));
        }
    };
}

function createBagItem(bagItem) {
    if (!bagItem) {
        var bagItem = $.extend({}, emptySlot);
    }
    var itemSlot = $("<div/>", {class: "item r_"+bagItem.rarity+" "+bagItem.type+
                                       (!bagItem.binding ? " unBound" : "")+
                                       (bagItem.binding == "Account" ? " accBound" : "")+
                                       (bagItem.binding == "Character" ? " chaBound "+bagItem.bound_to : ""),
                                       //+(bagItem.location == "EquippedFromLegendaryArmory" ? " Armory" : ""),
                                level: bagItem.level,
                                slot: bagItem.slot,
                                html: $("<img/>", {src: bagItem.icon})
                    }).data("name", (bagItem.name).toLowerCase());
    if (bagItem.count > 1) {
        itemSlot.append($("<span/>", {class: "count", text: formatNbr(bagItem.count)}));
    } else if (bagItem.count < 1) {
        itemSlot.addClass("r_Empty");
    } else if (bagItem.charges > 1) {
        itemSlot.append($("<span/>", {class: "count charge", text: formatNbr(bagItem.charges)}));
    }
    if (!itemSlot.hasClass("Empty")) {
        itemSlot.hover(function() {
            $("#toolTip").toggle();
        });
        itemSlot.mouseenter(function() {
            createTooltip(bagItem, itemSlot);
        });
    }
    return itemSlot;
}

function createTooltip(bagItem, itemSlot) {
    //if (bagItem.bound_to) { var binding = "Lié à : "+bagItem.bound_to; }
    //else if (bagItem.binding == "Account") { var binding = "Lié au compte"; }
    //else if (bagItem.location == "EquippedFromLegendaryArmory") { var binding = "Armurerie légendaire"; }
    $("#toolTip").empty().append(
        $("<div/>", {class: bagItem.rarity, text: bagItem.name+(bagItem.level !== 0 ? " ("+bagItem.level+")": "")}),
        $("<div/>", {text: bagItem.description}),
        $("<div/>", {class: "inactive", text: bagItem.skin ? bagItem.default_skin : ""}),
        bagItem.bound_to ? $("<div/>", {text: "Lié à : "+bagItem.bound_to}) : "",
        bagItem.binding == "Account" ? $("<div/>", {text: "Lié au compte"}) : "",
        $.map([].concat(bagItem.upgrades, bagItem.infusions).filter(Number), function(upIt) {
            return createTooltipItem(items.cache[upIt]);
        })
    );
    positionTooltip(itemSlot);
}

function positionTooltip(itemSlot) {
    var ttWidth = $("#toolTip").width();
    var docWidth = $(document).width();

    if ((yPos = itemSlot.offset().top - $("#toolTip").height() - 6) < 0) {
        yPos = itemSlot.offset().top + 32
    }
    if ((xPos = itemSlot.offset().left) + ttWidth > docWidth) {
        xPos = docWidth - ttWidth - 30
    }

    $('#toolTip').css({
      'top': yPos,
      'left': xPos
    });
}

function createTooltipItem(bagItem) {
    var itemSlot = $("<div/>", {class: "item tt r_"+bagItem.rarity+
                                       (bagItem.flags.indexOf("AccountBound") > -1 ? " accBound" : "")+
                                       (bagItem.flags.indexOf("SoulBindOnAcquire") > -1 ? " chaBound" : ""),
                                 html: $("<img/>", {src: bagItem.icon})});
    bagItem.name.indexOf("+") > -1 ? itemSlot.append($("<span/>", {class: "count", text: bagItem.name.match(/(\+.*?)( |$)/)[1]})) : "";
    return itemSlot;
}

function sortStuff() {
    $("allStuff").off();
    return $(".stuff").each(function() {
        $(this).append(
            $("<div/>", {class: "flexme"}).append(
                $("<div/>", {class: "colo"}).append(
                    $(this).find("[slot=Helm]").length ? $(this).find("[slot=Helm]") : createBagItem(null),
                    $(this).find("[slot=Shoulders]").length ? $(this).find("[slot=Shoulders]") : createBagItem(null),
                    $(this).find("[slot=Coat]").length ? $(this).find("[slot=Coat]") : createBagItem(null),
                    $(this).find("[slot=Gloves]").length ? $(this).find("[slot=Gloves]") : createBagItem(null),
                    $(this).find("[slot=Leggings]").length ? $(this).find("[slot=Leggings]") : createBagItem(null),
                    $(this).find("[slot=Boots]").length ? $(this).find("[slot=Boots]") : createBagItem(null)),
                $("<div/>", {class: "colo"}).append(
                    $(this).find("[slot=WeaponA1]").length ? $(this).find("[slot=WeaponA1]") : createBagItem(null),
                    $(this).find("[slot=WeaponA2]").length ? $(this).find("[slot=WeaponA2]") : createBagItem(null),
                    $(this).find("[slot=WeaponB1]").length ? $(this).find("[slot=WeaponB1]") : createBagItem(null),
                    $(this).find("[slot=WeaponB2]").length ? $(this).find("[slot=WeaponB2]") : createBagItem(null),
                    $("<div/>", {class: "item", style: "border: none"}).data("name", ""),
                    $(this).find("[slot=Relic]").length ? $(this).find("[slot=Relic]") : createBagItem(null)),
                $("<div/>", {class: "colo"}).append(
                    $(this).find("[slot=HelmAquatic]").length ? $(this).find("[slot=HelmAquatic]") : createBagItem(null),
                    $(this).find("[slot=WeaponAquaticA]").length ? $(this).find("[slot=WeaponAquaticA]") : createBagItem(null),
                    $(this).find("[slot=WeaponAquaticB]").length ? $(this).find("[slot=WeaponAquaticB]") : createBagItem(null)),
                $("<div/>", {class: "colo"}).append(
                    $(this).find("[slot=Backpack]").length ? $(this).find("[slot=Backpack]") : createBagItem(null),
                    $(this).find("[slot=Accessory1]").length ? $(this).find("[slot=Accessory1]") : createBagItem(null),
                    $(this).find("[slot=Accessory2]").length ? $(this).find("[slot=Accessory2]") : createBagItem(null),
                    $(this).find("[slot=Amulet]").length ? $(this).find("[slot=Amulet]") : createBagItem(null),
                    $(this).find("[slot=Ring1]").length ? $(this).find("[slot=Ring1]") : createBagItem(null),
                    $(this).find("[slot=Ring2]").length ? $(this).find("[slot=Ring2]") : createBagItem(null))),
            $("<div/>", {id: "tools"}).append(
                $(this).find("[slot=Sickle]").length ? $(this).find("[slot=Sickle]") : createBagItem(null),
                    $("<div/>", {class: "item", style: "border: none; width: 8px"}).data("name", ""),
                $(this).find("[slot=Axe]").length ? $(this).find("[slot=Axe]") : createBagItem(null),
                    $("<div/>", {class: "item", style: "border: none; width: 8px"}).data("name", ""),
                $(this).find("[slot=Pick]").length ? $(this).find("[slot=Pick]") : createBagItem(null)),
            $("<div/>", {id: "fishing"}).append(
                $(this).find("[slot=FishingRod]").length ? $(this).find("[slot=FishingRod]") : createBagItem(null),
                    $("<div/>", {class: "item", style: "border: none; width: 8px"}).data("name", ""),
                $(this).find("[slot=FishingBait]").length ? $(this).find("[slot=FishingBait]") : createBagItem(null),
                    $("<div/>", {class: "item", style: "border: none; width: 8px"}).data("name", ""),
                $(this).find("[slot=FishingLure]").length ? $(this).find("[slot=FishingLure]") : createBagItem(null)),
            $("<div/>", {id: "jadebot"}).append(
                $(this).find("[slot=PowerCore]").length ? $(this).find("[slot=PowerCore]") : createBagItem(null),
                    $("<div/>", {class: "item", style: "border: none; width: 8px"}).data("name", ""),
                $(this).find("[slot=SensoryArray]").length ? $(this).find("[slot=SensoryArray]") : createBagItem(null),
                    $("<div/>", {class: "item", style: "border: none; width: 8px"}).data("name", ""),
                $(this).find("[slot=ServiceChip]").length ? $(this).find("[slot=ServiceChip]") : createBagItem(null))
        );
    });
}

function itemFilter() {
    $(".rarity + .Empty").prev().prop("checked", $(".rarity:not(:hidden):checked, .type:checked, .binding:checked").length == $(".rarity:not(:hidden), .type, .binding").length ? 1 : 0);
    var levIMin = ($("#levIMin").val() == "") ? 0 : parseInt($("#levIMin").val());
    var levIMax = ($("#levIMax").val() == "") ? 80 : parseInt($("#levIMax").val());
    var filterValue = $("#filterInp").val().toLowerCase();
    var toHide = $("#items input:checkbox:not(:checked, .checkAll)").map(function() {
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
        if ($(this).find(".item:not(.hidden)").length === 0) {
            $(this).addClass("hidden");
        } else {
            $(this).removeClass("hidden");
        }
    });
    $(".account").each(function() {
        if ($(this).find(".item:not(.hidden)").length === 0) {
            $(this).addClass("hidden");
        } else {
            $(this).removeClass("hidden");
        }
    });
}

function getTitle() {
  resetView("Title");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "titleList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("titles?ids=all"), function(titlesD) {
    titlesD.sort(function(a,b) {return a.name.localeCompare(b.name);})
    for(i in titlesD) {
      $("#titleList tbody").append($("<tr/>", {id: "title"+titlesD[i].id}).data("name", titlesD[i].name.toLowerCase()).append(
        $("<td/>", {class: "titlename", text: titlesD[i].name})
      ));
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/titles", key), function(aTitlesD) {
        $("thead tr td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody tr td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
        for(i in aTitlesD) {
          $("#title"+aTitlesD[i]+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
        }
      });
    });
  });
}

function getWallet() {
  resetView("Wallet");
  $(".simpleFilter").removeClass("hidden");
  $("#content").append($("<table/>", {id: "walletList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"), $("<td/>"))), $("<tbody/>")));
  $.getJSON(getURL("currencies?ids=all"), function(currenciesD) {
    currenciesD.sort(function(a,b) {return a.order > b.order;});
    for(i in currenciesD) {
      $("#walletList tbody").append($("<tr/>", {id: "curr"+currenciesD[i].id}).data("name", currenciesD[i].name.toLowerCase()).append(
        $("<td/>", {html: $("<img/>", {src: currenciesD[i].icon, title: currenciesD[i].description ? currenciesD[i].description.replace(/\"/g,'&quot;') : ""})}),
        $("<td/>", {class: "currname", text: currenciesD[i].name})
        ));
    }
  });
  $.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accountD) {
      var accName = accountD.name;
      var account = accountD.name.replace(/\s|\./g,"");
      $.getJSON(getURL("account/wallet", key), function(aWalletD) {
        $("thead tr td:last-of-type").after($("<td/>", {text: accName}));
        $("tbody tr td:last-of-type").after($("<td/>", {class: account}));
        for(i in aWalletD) {
          if (aWalletD[i].id == "1") {
            $("#curr"+aWalletD[i].id+" td."+account).text(formatPognon(aWalletD[i].value+''));
          } else {
            $("#curr"+aWalletD[i].id+" td."+account).text(formatNbr(aWalletD[i].value));
        }
        }
      });
    });
  });
}

function getWardrobe() {
    resetView("Wardrobe");
    $(".simpleFilter").removeClass("hidden");
    $("#content").append($("<table/>", {id: "wardList"}).append($("<thead/>").append($("<tr/>").append($("<td/>"), $("<td/>"))), $("<tbody/>")));
    jQuery.ajaxSetup({async:false});
    $.getJSON(getURL("skins?page=1000&page_size=200"), function() {}).fail(function(skinsDE, err) {
        var count = skinsDE.responseText.slice(skinsDE.responseText.lastIndexOf("- ")+2, skinsDE.responseText.lastIndexOf("."));
        while (count > -1) {
            $.getJSON(getURL("skins?page="+count+"&page_size=200"), function(skinsD) {
                for(var skin in skinsD) {
                    skinsD[skin].description = skinsD[skin].description ? skinsD[skin].description.replace(/\"/g,'&quot;') : "";
                    $("#wardList tbody").append($("<tr/>", {id: "skin"+skinsD[skin].id}).data("name", skinsD[skin].name.toLowerCase()).append(
                        $("<td/>").html("<img src=\""+skinsD[skin].icon+"\" title=\""+skinsD[skin].description+"\">"),
                        $("<td/>", {class: "skinname "+skinsD[skin].rarity, text: skinsD[skin].name})
                        ));
                }
            });
            count--;
        }
    });
    $.each(guids, function(i, key) {
        $.getJSON(getURL("account", key), function(accountD) {
            var accName = accountD.name;
            var account = accountD.name.replace(/\s|\./g,"");
            $.getJSON(getURL("account/skins", key), function(aSkinsD) {
                $("thead tr td:last-of-type").after($("<td/>", {class: "accName", text: accName}));
                $("tbody tr td:last-of-type").after($("<td/>", {class: account}).append($("<img/>", {src: icony("no"), alt: "0", class: "yesno"})));
                for(var id in aSkinsD) {
                    $("#skin"+aSkinsD[id]+" td."+account+" img").attr({src: icony("yes"), alt: "1"});
                }
            });
        });
    });
    jQuery.ajaxSetup({async:true});
}
