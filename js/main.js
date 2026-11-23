// T'inquiète : menu sur téléphone, animations, démonstrations, messages WhatsApp, formulaire.
// Sans JavaScript, la page reste entièrement lisible : les démonstrations s'affichent figées,
// les liens WhatsApp fonctionnent, et le formulaire ouvre quand même WhatsApp.
(function () {
  var doc = document;
  var NB = String.fromCharCode(160); // espace insécable : avant « ? », « : », « € », entre un nombre et son unité
  var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(sel, racine) { return (racine || doc).querySelector(sel); }
  function $$(sel, racine) { return Array.prototype.slice.call((racine || doc).querySelectorAll(sel)); }
  function euros(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB) + NB + '€'; }
  function signaler(el) { if (!el) return; el.classList.remove('est-change'); void el.offsetWidth; el.classList.add('est-change'); }

  /* ---------- Menu sur téléphone ---------- */
  var menu = $('.menu');
  if (menu) {
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) menu.open = false; });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.open) { menu.open = false; $('summary', menu).focus(); } });
    doc.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  }

  /* ---------- Le logo rejoue son animation quand on le survole ---------- */
  var logo = $('.logo--anime');
  if (logo && !calme) {
    var libre = Date.now() + 2400;
    logo.addEventListener('mouseenter', function () {
      if (Date.now() < libre) return;
      libre = Date.now() + 2400;
      logo.classList.remove('logo--anime'); void logo.offsetWidth; logo.classList.add('logo--anime');
    });
  }

  /* ---------- Ombre sous la barre dès qu'on descend ---------- */
  var entete = $('.entete');
  if (entete) {
    var ombre = function () { entete.classList.toggle('est-descendue', window.scrollY > 8); };
    ombre(); window.addEventListener('scroll', ombre, { passive: true });
  }

  /* ---------- Le menu indique la section où on se trouve ---------- */
  var liensMenu = $$('.entete__nav a[href^="#"]');
  if (liensMenu.length && 'IntersectionObserver' in window) {
    // Un bloc peut dépendre d'une entrée du menu sans y figurer : data-menu="services" le rattache à « Ce qu'on fait ».
    var lienDe = {}, traverse = {};
    liensMenu.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      $$('#' + id + ', [data-menu="' + id + '"]').forEach(function (s) { lienDe[s.id] = a; });
    });
    // Le repère est une ligne placée à 40 % de la hauteur de l'écran : la section qui la traverse est la section en cours.
    var espion = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { traverse[en.target.id] = en.isIntersecting; });
      liensMenu.forEach(function (a) {
        var actif = Object.keys(lienDe).some(function (id) { return lienDe[id] === a && traverse[id]; });
        if (actif) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-40% 0px -60% 0px', threshold: 0 });
    Object.keys(lienDe).forEach(function (id) { espion.observe(doc.getElementById(id)); });
  }

  /* ---------- Les blocs arrivent en douceur ---------- */
  if ('IntersectionObserver' in window && !calme) {
    var cibles = $$('.metier__tete, .appel, .metier__pour, .offre__carte, .offre__suite, .section__tete, .rapport > *, .calcul, .problemes__tete, .bulle, .echange__lien, .problemes__suite, .choix, .carte, .besoins__tete, .besoins__exemples, .etape, .question, .zone > *, .contact__grille > *');
    var vue = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('est-visible'); vue.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    // Dans une série (les trois lignes du métier, les gains, les étapes), les éléments arrivent l'un après l'autre.
    var rang = function (el) { return Array.prototype.indexOf.call(el.parentNode.children, el); };
    cibles.forEach(function (el) {
      var delai = 0;
      if (el.classList.contains('bulle--nous')) delai = 0.35;
      else if (el.classList.contains('echange__lien')) delai = 0.6;
      else if (el.matches('.appel, .offre__carte, .carte, .etape')) delai = rang(el) * 0.12;
      if (delai) el.style.setProperty('--delai', delai + 's');
      el.classList.add('revele'); vue.observe(el);
    });
  }

  /* ---------- WhatsApp : chaque lien ouvre la conversation avec un message déjà écrit ---------- */
  // L'attribut data-wa contient la suite du message, après « Bonjour, ».
  // Quand la personne choisit son métier dans les démonstrations, on l'ajoute au message.
  var liensWa = $$('a[data-wa]');
  var domaineChoisi = null;   // « dans la coiffure », « comme kiné »… dès qu'un métier est choisi
  function ecrireLiens(domaine) {
    if (domaine !== undefined) domaineChoisi = domaine;
    liensWa.forEach(function (a) {
      var suite = a.dataset.wa, message;
      if (!domaineChoisi) message = 'Bonjour, ' + suite;
      else if (suite.indexOf('mon problème') === 0) message = 'Bonjour, je travaille ' + domaineChoisi + '. M' + suite.slice(1);
      else message = 'Bonjour, je travaille ' + domaineChoisi + ' et ' + suite;
      a.href = a.href.split('?')[0] + '?text=' + encodeURIComponent(message);
    });
  }

  /* ---------- Avant / après : on fait glisser pour comparer ---------- */
  // Une réglette invisible couvre toute l'image : souris, doigt ou clavier, elle déplace la séparation.
  $$('.avant-apres').forEach(function (fig) {
    var curseur = $('.avant-apres__curseur', fig), touche = false;
    var poser = function (v) { fig.style.setProperty('--pos', v + '%'); };
    curseur.addEventListener('input', function () { touche = true; poser(curseur.value); });
    poser(curseur.value);
    // À l'arrivée dans l'écran, la séparation glisse une fois de « avant » vers « après », pour montrer que ça bouge.
    if ('IntersectionObserver' in window && !calme) {
      var guet = new IntersectionObserver(function (entrees) {
        if (!entrees[0].isIntersecting) return;
        guet.disconnect();
        var de = 88, vers = 38, debut = null;
        curseur.value = de; poser(de);
        requestAnimationFrame(function pas(t) {
          if (touche) return;
          if (debut === null) debut = t;
          var k = Math.max(0, Math.min(1, (t - debut - 400) / 1400));
          var douceur = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          var v = de + (vers - de) * douceur;
          curseur.value = v; poser(v);
          if (k < 1) requestAnimationFrame(pas);
        });
      }, { threshold: 0.55 });
      guet.observe(fig);
    }
  });

  /* ---------- Le calcul : les heures de paperasse, avec le chiffre du visiteur ---------- */
  // 46 semaines de travail par an, journées de 8 heures. On compte, on ne promet rien.
  var calcul = $('.calcul');
  if (calcul) {
    var reglette = $('input[type="range"]', calcul), lienCalcul = $('a[data-wa]', calcul);
    var ecrire = function (nom, valeur) { $('[data-calcul="' + nom + '"]', calcul).textContent = valeur; };
    var compter = function () {
      var h = +reglette.value, an = h * 46;
      ecrire('heures', h); ecrire('an', an); ecrire('jours', Math.round(an / 8));
      reglette.style.setProperty('--rempli', ((h - reglette.min) / (reglette.max - reglette.min) * 100) + '%');
      lienCalcul.dataset.wa = 'je passe environ ' + h + NB + 'h par semaine sur mes papiers. J’aimerais en récupérer une partie' + NB + ': ';
      ecrireLiens();
    };
    reglette.addEventListener('input', compter);
    compter();
  }

  /* ---------- Démonstrations ---------- */
  var METIERS = {
    macon:     { nom: 'Maçon',     photo: { demande: 'Tu peux ajouter la photo de mon dernier mur' + NB + '?', legende: 'Dernier mur en pierre' },       domaine: 'dans la maçonnerie', enseigne: 'Maçonnerie Exemple', accroche: 'Gros œuvre, rénovation, terrasses',       titre: 'Nouveau devis', client: 'Chantier rue de la Gare',                   lignes: [['Mur de clôture, 12' + NB + 'm', 1850, 1], ['Fondations', 640, 1], ['Évacuation des terres', 180, 1]] },
    menuisier: { nom: 'Menuisier', photo: { demande: 'Tu peux ajouter la photo de ma dernière porte' + NB + '?', legende: 'Dernière porte en chêne' },   domaine: 'dans la menuiserie', enseigne: 'Menuiserie Exemple', accroche: 'Portes, escaliers et meubles sur mesure', titre: 'Nouveau devis', client: 'Chantier rue de la Gare',                   lignes: [['Porte intérieure chêne', 490, 2], ['Pose et finitions', 320, 1], ['Déplacement', 40, 1]] },
    coiffeuse: { nom: 'Coiffeuse', photo: { demande: 'Tu peux ajouter la photo de ma dernière coupe' + NB + '?', legende: 'La coupe de la semaine' },        domaine: 'dans la coiffure',   enseigne: 'Salon Exemple',      accroche: 'Coupe, couleur, barbe',                   titre: 'Nouvelle note', client: 'Rendez-vous de 14' + NB + 'h' + NB + '30', lignes: [['Coupe et brushing', 38, 1], ['Couleur', 55, 1], ['Soin', 15, 1]] },
    garagiste: { nom: 'Garagiste', photo: { demande: 'Tu peux ajouter une photo de l’atelier' + NB + '?', legende: 'Prêts pour les pneus hiver' },         domaine: 'dans un garage',     enseigne: 'Garage Exemple',     accroche: 'Entretien, pneus, contrôle technique',    titre: 'Nouveau devis', client: 'Voiture en atelier',                        lignes: [['Entretien annuel', 189, 1], ['Plaquettes avant', 120, 1], ['Main-d’œuvre', 95, 1]] },
    kine:      { nom: 'Kiné',      photo: { demande: 'Tu peux ajouter une photo du cabinet' + NB + '?', legende: 'La salle de soins' },                   domaine: 'comme kiné',         enseigne: 'Cabinet Exemple',    accroche: 'Kinésithérapie, rééducation',             titre: 'Nouvelle note', client: 'Patient de 10' + NB + 'h',                  lignes: [['Séance', 30, 3], ['Bilan', 45, 1], ['Déplacement à domicile', 10, 1]] },
    traiteur:  { nom: 'Traiteur',  photo: { demande: 'Tu peux ajouter la photo de mon dernier buffet' + NB + '?', legende: 'Buffet froid du week-end' },             domaine: 'comme traiteur',     enseigne: 'Traiteur Exemple',   accroche: 'Buffets, banquets, plats du jour',        titre: 'Nouveau devis', client: 'Fête de famille',                           lignes: [['Buffet froid, 30' + NB + 'personnes', 750, 1], ['Service en salle', 240, 1], ['Livraison', 45, 1]] }
  };
  var zoneDemo = $('#services');
  if (zoneDemo && $('[data-champ="lignes"]', zoneDemo)) {
    var etat = { metier: 'menuisier', qte: [2, 1, 1], prix: [490, 320, 40], paye: false, photo: false };
    var champ = function (nom) { return $('[data-champ="' + nom + '"]', zoneDemo); };
    var total = function () { return etat.prix.reduce(function (s, p, i) { return s + p * etat.qte[i]; }, 0); };

    var rendreDevis = function () {
      var m = METIERS[etat.metier];
      champ('lignes').innerHTML = m.lignes.map(function (l, i) {
        return '<div class="m-article"><span class="m-article__nom">' + l[0] + '</span>' +
          '<span class="m-qte"><button type="button" data-pas="-1" data-i="' + i + '" aria-label="Retirer une unité' + NB + ': ' + l[0] + '">−</button>' +
          '<output>' + etat.qte[i] + '</output>' +
          '<button type="button" data-pas="1" data-i="' + i + '" aria-label="Ajouter une unité' + NB + ': ' + l[0] + '">+</button></span>' +
          '<b>' + euros(etat.prix[i] * etat.qte[i]) + '</b></div>';
      }).join('');
      champ('total').textContent = euros(total());
      if (!etat.paye) champ('montant').textContent = euros(total());
    };
    // La photo ajoutée sur le site de démonstration : une par métier, chargée seulement quand on la demande.
    // Son adresse est écrite sur le bouton du métier (data-photo).
    var photoDe = {};
    $$('.choix__bouton').forEach(function (b) { photoDe[b.dataset.metier] = b.dataset.photo; });
    var rendrePhoto = function () {
      if (!etat.photo) return;
      var el = champ('photo');
      el.innerHTML = '<img src="' + photoDe[etat.metier] + '" alt="" width="480" height="210"><b>Nouveau</b><figcaption>' + METIERS[etat.metier].photo.legende + '</figcaption>';
      el.hidden = false;
    };
    var rendreMetier = function () {
      var m = METIERS[etat.metier];
      champ('enseigne').textContent = m.enseigne;
      champ('accroche').textContent = m.accroche;
      champ('titre-devis').textContent = m.titre;
      champ('client').textContent = m.client;
      rendreDevis();
      rendrePhoto();
    };
    var changerMetier = function (cle) {
      etat.metier = cle; etat.qte = METIERS[cle].lignes.map(function (l) { return l[2]; }); etat.prix = METIERS[cle].lignes.map(function (l) { return l[1]; });
      remettreFacture(); remettreEnvoi();
      $$('.choix__bouton').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.metier === cle)); });
      rendreMetier();
      ['enseigne', 'accroche', 'total', 'montant'].forEach(function (n) { signaler(champ(n)); });
      // Le métier choisi suit la personne : dans le formulaire et dans les messages WhatsApp.
      var champMetier = doc.getElementById('metier');
      if (champMetier && (!champMetier.value || champMetier.dataset.auto === '1')) { champMetier.value = METIERS[cle].nom; champMetier.dataset.auto = '1'; }
      ecrireLiens(METIERS[cle].domaine);
    };

    // Le devis : quantités, total, envoi
    var boutonEnvoi = $('[data-action="envoyer"]', zoneDemo);
    var remettreEnvoi = function () { boutonEnvoi.textContent = 'Envoyer au client'; boutonEnvoi.classList.remove('est-fait'); };
    champ('lignes').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-pas]'); if (!b) return;
      var i = +b.dataset.i;
      etat.qte[i] = Math.max(0, Math.min(99, etat.qte[i] + (+b.dataset.pas)));
      remettreEnvoi(); remettreFacture(); rendreDevis();
      signaler(champ('total')); signaler(champ('montant'));
      var meme = $('button[data-pas="' + b.dataset.pas + '"][data-i="' + i + '"]', champ('lignes')); if (meme) meme.focus();
    });
    boutonEnvoi.addEventListener('click', function () {
      if (total() === 0) { boutonEnvoi.textContent = 'Ajoute au moins une ligne'; return; }
      boutonEnvoi.textContent = 'C’est envoyé'; boutonEnvoi.classList.add('est-fait');
      signaler(champ('montant'));
    });

    // La facture : paiement simulé
    var boutonPayer = $('[data-action="payer"]', zoneDemo);
    var statut = champ('statut');
    function remettreFacture() {
      etat.paye = false; $('span', statut).textContent = 'Envoyée par Peppol';
      champ('echeance').textContent = 'à payer avant le 30' + NB + 'novembre';
      boutonPayer.textContent = 'Simuler le paiement'; boutonPayer.classList.remove('est-fait');
    }
    boutonPayer.addEventListener('click', function () {
      if (etat.paye) { remettreFacture(); champ('montant').textContent = euros(total()); return; }
      etat.paye = true; $('span', statut).textContent = 'Payée par QR code';
      champ('echeance').textContent = 'reçu sur ton compte, rien à relancer';
      boutonPayer.textContent = 'Recommencer'; boutonPayer.classList.add('est-fait');
      signaler(statut);
    });

    // Le site : le bouton Appeler
    $('[data-action="appeler"]', zoneDemo).addEventListener('click', function () {
      champ('info-site').textContent = 'Sur ton vrai site, le GSM compose ton numéro.';
    });

    // Le suivi : une demande, une réponse, et l'écran concerné change
    var fil = champ('fil');
    var DEMANDES = {
      horaires: { toi: 'Tu peux mettre que je suis fermé du 24 au 2' + NB + '?', nous: 'C’est fait, c’est sur ton site.', cible: '#demo-site', faire: function () { var el = champ('horaires'); el.innerHTML = '<b>Fermé</b> du 24 au 2'; signaler(el); } },
      // La photo : la demande et l'image dépendent du métier choisi. L'image commence à charger dès le clic.
      photo:    { toi: function () { return METIERS[etat.metier].photo.demande; }, nous: 'Ajoutée sur ton site.', cible: '#demo-site',
                  preparer: function () { new Image().src = photoDe[etat.metier]; },
                  faire: function () { etat.photo = true; rendrePhoto(); var el = champ('photo'); el.classList.remove('est-nouvelle'); void el.offsetWidth; el.classList.add('est-nouvelle'); } },
      prix:     { toi: 'Mon premier prix a augmenté de' + NB + '10' + NB + '€, tu corriges' + NB + '?', nous: 'Corrigé dans tes devis.', cible: '#demo-devis', faire: function () { etat.prix[0] += 10; remettreEnvoi(); remettreFacture(); rendreDevis(); signaler(champ('total')); signaler(champ('montant')); } }
    };
    var bulle = function (classe, contenu) {
      var p = doc.createElement('p'); p.className = 'm-bulle ' + classe + ' est-nouvelle'; p.innerHTML = contenu; fil.appendChild(p); fil.scrollTop = fil.scrollHeight; return p;
    };
    $$('.m-demandes button', zoneDemo).forEach(function (b) {
      b.addEventListener('click', function () {
        var d = DEMANDES[b.dataset.demande]; b.disabled = true;
        if (d.preparer) d.preparer();
        bulle('m-bulle--toi', typeof d.toi === 'function' ? d.toi() : d.toi);
        var attente = bulle('m-bulle--nous', '<span class="m-frappe" aria-label="T’inquiète écrit"><i></i><i></i><i></i></span>');
        setTimeout(function () {
          d.faire();
          attente.innerHTML = d.nous + '<br><a href="' + d.cible + '">Voir le résultat</a>';
          fil.scrollTop = fil.scrollHeight;
        }, calme ? 0 : 900);
      });
    });
    fil.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      e.preventDefault();
      var cible = $(a.getAttribute('href')); if (!cible) return;
      cible.scrollIntoView({ behavior: calme ? 'auto' : 'smooth', block: 'center' });
      signaler($('.ecran', cible));
    });

    $$('.choix__bouton').forEach(function (b) { b.addEventListener('click', function () { changerMetier(b.dataset.metier); }); });
    rendreMetier();
  }

  /* ---------- Formulaire : il prépare le message et l'ouvre dans WhatsApp ---------- */
  var formulaire = doc.getElementById('formulaire');
  var retour = doc.getElementById('formulaire-retour');
  if (!formulaire || !retour) return;
  formulaire.noValidate = true; // nos propres messages, en clair, plutôt que ceux du navigateur

  // Raccourcis : un clic ajoute ou retire la phrase dans le message.
  var texte = doc.getElementById('probleme');
  $$('.raccourcis-texte button', formulaire).forEach(function (b) {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      var phrase = b.dataset.phrase, actif = b.getAttribute('aria-pressed') === 'true';
      if (actif) texte.value = texte.value.replace(phrase, '').replace(/\s{2,}/g, ' ').trim();
      else texte.value = (texte.value.trim() + ' ' + phrase).trim();
      b.setAttribute('aria-pressed', String(!actif));
      texte.removeAttribute('aria-invalid');
    });
  });
  var champMetier = doc.getElementById('metier');
  if (champMetier) champMetier.addEventListener('input', function () { champMetier.dataset.auto = '0'; });

  var champs = $$('[required]', formulaire);
  champs.forEach(function (c) { c.addEventListener('input', function () { c.removeAttribute('aria-invalid'); }); });
  formulaire.addEventListener('submit', function (e) {
    e.preventDefault();
    var vide = null;
    champs.forEach(function (c) {
      var manque = !c.value.trim();
      if (manque) c.setAttribute('aria-invalid', 'true'); else c.removeAttribute('aria-invalid');
      if (manque && !vide) vide = c;
    });
    if (vide) {
      var nom = $('label[for="' + vide.id + '"]', formulaire).textContent.replace(/\s*\?\s*$/, '').toLowerCase();
      retour.textContent = 'Il manque une case' + NB + ': «' + NB + nom + NB + '».';
      vide.focus();
      return;
    }
    var v = function (id) { return doc.getElementById(id).value.trim(); };
    var metier = v('metier');
    if (/^[A-ZÀ-Þ][a-zà-ÿ]/.test(metier)) metier = metier.charAt(0).toLowerCase() + metier.slice(1);
    var message = 'Bonjour, c’est ' + v('nom') + ' (' + metier + ').\n\n' + v('probleme');
    var lien = doc.createElement('a');
    lien.href = formulaire.getAttribute('action') + '?text=' + encodeURIComponent(message);
    lien.target = '_blank'; lien.rel = 'noopener';
    lien.textContent = 'Ouvrir WhatsApp à nouveau';
    // Une phrase par ligne, puis un lien de secours si rien ne s'est ouvert.
    retour.textContent = '';
    ['WhatsApp s’ouvre avec ton message.', 'Il reste à appuyer sur Envoyer.'].forEach(function (ligne) {
      var phrase = doc.createElement('span'); phrase.className = 'phrase'; phrase.textContent = ligne; retour.appendChild(phrase);
    });
    retour.appendChild(lien);
    lien.click();
  });
})();
