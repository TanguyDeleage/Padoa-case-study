# Spécifications — Détail d'une AMT (MVP)

Version du prototype : canvas « AMT — MVP 2 », artboard *MVP 2*.
Contexte : modale full page de détail d'une AMT (action en milieu de travail) dans padoa, pour l'IPRP qui documente ses passages chez l'adhérent, en différé, sur ordinateur.

---

## 0. Principes et vocabulaire

- **Évènement** : un créneau daté (intervention, rédaction). C'est **la seule source de temps** de l'AMT.
- **Tâche** : une chose à faire sur l'AMT, sans durée. Elle ne consomme pas de temps alloué.
- **Unité de temps** : dans les évènements, tout est exprimé en **heures décimales, par pas de 0,25 h**.
- **Participants et occurrences** : un évènement (rendez-vous) peut réunir plusieurs intervenants. **Chaque participant a sa propre occurrence de l’évènement, avec son propre temps.** Les occurrences qui partagent le même rendez-vous sont liées par un identifiant commun. Le temps prévu est commun à toutes les occurrences (c’est le créneau de l’agenda) ; le temps réel et le compte rendu sont propres à chaque occurrence.
- **Traçabilité** : toute modification est tracée dans l'onglet Activité (avant → après) et, sauf mention contraire, peut être annulée depuis le toast de confirmation.

---

## 1. Notifications

**Objectif.** Signaler à l'utilisateur connecté ce qui demande son attention sur l'AMT, sans parcourir le tableau des évènements.

**Contenu.** Une carte « Notifications » contenant jusqu'à deux messages, affichés ensemble, l'erreur en premier.

| Niveau | Message | Condition d'affichage |
|---|---|---|
| Erreur (rouge, icône ronde) | « Un évènement est prévu après l'échéance » / « N évènements sont prévus après l'échéance » | Au moins un évènement de l'utilisateur est à venir et daté après l'échéance de l'AMT |
| Avertissement (orange, icône triangle) | « Des informations sont à compléter » | Au moins un évènement de l'utilisateur est à l'état « À compléter » (voir 4.3) |

**Règles de gestion**

- **RG-N1** — Seuls les évènements dont l'utilisateur connecté est l'intervenant sont pris en compte.
- **RG-N2** — La carte est masquée quand il n'y a ni erreur ni avertissement.
- **RG-N3** — Les messages se mettent à jour en temps réel (saisie d'un temps réel, ajout d'un compte rendu, changement d'échéance, modification ou suppression d'un évènement).

**Points ouverts**

- Les messages ne sont pas cliquables : faut-il un lien vers la première ligne concernée ?
- « Des informations sont à compléter » regroupe deux cas (temps réel manquant, compte rendu de rédaction manquant) sans les distinguer.

---

## 2. Liste des tâches

**Objectif.** Garder une trace des choses à faire sur l'AMT qui ne sont pas des évènements (envoyer un document, relancer l'adhérent…).

**Contenu**

- En-tête : titre « Liste des tâches », compteur « X / Y faites » accolé au titre, bouton « Ajouter un élément » aligné à droite.
- Liste : une case à cocher et un intitulé par tâche.

**Règles de gestion**

- **RG-T1** — Une tâche a un intitulé et un état (à faire / faite). Pas de responsable, pas d'échéance, pas de durée.
- **RG-T2** — Cocher une tâche la barre et la grise ; décocher la rouvre. Les deux actions sont tracées dans l'Activité.
- **RG-T3** — « Ajouter un élément » ouvre un champ sous la liste, avec « Ajouter » et « Annuler ». La touche Entrée valide. Un intitulé vide est refusé (bordure rouge).
- **RG-T4** — Une icône poubelle apparaît à droite de chaque tâche, au survol ou au focus clavier. La suppression est immédiate, tracée, et annulable depuis le toast.
- **RG-T5** — La liste défile à l'intérieur de sa carte quand elle dépasse la hauteur disponible.

**Points ouverts**

- Quand la carte Notifications est affichée, le défilement interne ne laisse voir que peu de tâches.
- L'ordre est celui de création : faut-il remonter les tâches à faire au-dessus des tâches faites ?

---

## 3. Avancement et Temps

Deux cartes distinctes : l'**avancement** (où en est l'AMT dans son calendrier) et le **temps** (combien d'heures ont été consommées sur l'enveloppe allouée).

### 3.1 Avancement

**Objectif.** Situer l'AMT entre son ouverture et son échéance, et piloter son statut.

**Contenu**

- Titre « Avancement », avec à droite le **sélecteur de statut** de l'AMT.
- **Barre de progression** : part du délai écoulé entre l'ouverture et l'échéance.
- Sous la barre : « Ouverte le 2 oct. 2026 » ; à droite, « Échéance » avec un **champ date** modifiable et une pastille « J-x ».

**Règles de gestion**

- **RG-P1 — Statut de l'AMT.** Sept valeurs : À faire, En cours, À valider, Validé, Terminé, Suspendu, Abandonné. Tout changement est tracé et annulable.
- **RG-P5 — Échéance.** Modifiable directement dans le champ ; enregistrée à la sortie du champ (ou Entrée), tracée et annulable. La date est obligatoire : un champ vidé reprend la date enregistrée ; Échap annule la saisie. « Ajouter › Date d'échéance » place le curseur dans ce champ. La pastille affiche « J-x » ou « Dépassée » ; elle est rouge à 21 jours ou moins de l'échéance, neutre sinon.
- **RG-P6 — Barre.** (Aujourd'hui − ouverture) / (échéance − ouverture), bornée à 100 %. Rouge une fois l'échéance dépassée.

### 3.2 Temps

**Objectif.** Voir d'un coup d'œil le temps consommé par rapport au temps alloué.

**Contenu**

- **Graphique en anneau** : temps passé au centre (« Passé 10h30 sur 20h »), réparti par catégorie ; la part grise est l'alloué non utilisé.
- **Légende chiffrée** : Intervention, Rédaction, Trajet, Alloué non utilisé (ou Dépassement) ; puis **Temps alloué** modifiable, en heures.

**Règles de gestion**

- **RG-P2 — Temps passé.** Somme des temps des occurrences passées, tous participants confondus (un rendez-vous de 2 h à 3 participants compte 6 h). Pour chaque catégorie, on prend le temps réel saisi, sinon le temps prévu.
- **RG-P3 — Temps alloué.** Modifiable dans le champ (décimal, ≥ 0) ; enregistré à la sortie du champ, tracé et annulable. Une saisie invalide reprend la valeur enregistrée.
- **RG-P4 — Alloué non utilisé.** Alloué − Passé. Si le passé dépasse l'alloué, la ligne devient « Dépassement », en rouge, et le total au centre de l'anneau passe en rouge.

**Points ouverts**

- Les évènements « À compléter » comptent dans le temps passé avec leur prévu, sans que ce soit signalé (« dont X h à compléter » ?).
- Le temps planifié à venir n'est pas affiché : un dépassement prévisible reste invisible.
- Qui a le droit de modifier le temps alloué ?

---

## 4. Évènements

### 4.1 Tableau

**Objectif.** Présenter la chronologie des évènements de l'AMT et ce qui reste à compléter.

| Colonne | Contenu |
|---|---|
| Alerte | Icône rouge si erreur, orange si avertissement, rien sinon. Le survol affiche le motif. |
| Date | **En lecture seule.** En rouge si l'évènement est en erreur. |
| Horaire | « 14h00 – 16h00 », puis « Prévu X h » (à venir) ou « Total X h » (passé). |
| Évènement | Titre, puis type (Intervention ou Rédaction). |
| Intervenants | Jusqu’à 3 avatars, l’utilisateur connecté en premier. Au-delà de 3 participants, le 3ᵉ avatar devient « +N » (participants restants). Au survol, une infobulle donne le nom de l’intervenant, ou la liste des participants restants pour « +N ». |
| Statut | Pastille de statut, en lecture seule (voir 4.3). |
| Actions | Icône de document si un compte rendu existe · menu « ⋮ » · chevron de dépliage. |

**Règles de gestion**

- **RG-E0 — Une ligne par rendez-vous.** Les occurrences d’un même rendez-vous forment une seule ligne. La ligne (alerte, temps, statut, icône de compte rendu) reflète l’occurrence de l’utilisateur connecté. S’il ne participe pas, elle reflète l’occurrence la moins avancée (À compléter avant Réalisé), et la colonne Temps affiche toujours le prévu.
- **RG-E1 — Tri.** Du plus lointain au plus ancien.
- **RG-E2 — Repères.** Une ligne « Aujourd'hui · date » et une ligne « Échéance de l'AMT · date · J-x » s'insèrent à leur place chronologique.
- **RG-E3 — Menu « ⋮ ».** Placé à gauche du chevron. Il propose :
  - **Modifier l'évènement** : rouvre la modale de création, préremplie (voir 4.2) ;
  - **Supprimer l'évènement** : *évènements à venir (Prévu) uniquement* ; supprime le rendez-vous et toutes ses occurrences ; suppression immédiate, tracée, annulable. Un évènement passé (À compléter ou Réalisé) ne peut pas être supprimé : s'il n'a pas eu lieu, l'utilisateur saisit un temps réel de 0 avec une note dans le compte rendu.
  Le menu se ferme au clic à l'extérieur ou au choix d'une action. La date et les horaires ne sont modifiables que par ce menu.
- **RG-E16 — Hauteur du tableau.** Le tableau ne dépasse jamais la hauteur visible de la colonne principale (hauteur de l'écran moins la barre de fermeture, l'en-tête de la modale, les marges et le titre de section) ; une marge est conservée sous le tableau. Au-delà, les lignes défilent **à l'intérieur du tableau**, avec la ligne d'en-tête figée ; les lignes dépliées défilent de la même manière. Avec peu d'évènements, le tableau prend sa hauteur naturelle. La colonne principale défile pour atteindre le contenu situé sous le tableau (§5). L'en-tête de la modale reste fixe, et la colonne latérale défile indépendamment.

### 4.2 Création et modification d'un évènement

#### Création

« Ajouter un évènement » (en-tête de la section Évènements) ou « Ajouter › Évènement » (en-tête de la modale) ouvre un **menu de type**, aligné sur le bouton :

| Entrée | Action |
|---|---|
| Intervention | Ouvre la modale « Ajouter une intervention ». |
| Autre type d'évènement | Ouvre la modale « Ajouter un évènement ». |
| Évènement collectif | Écran non reproduit dans le prototype. |
| AFP | Écran non reproduit dans le prototype. |

« Trouver un créneau d'intervention » **ne figure pas** dans ce menu. Le menu se ferme au clic à l'extérieur, avec Échap ou au choix d'une entrée.

La modale de création (petite modale, 460 px) reprend celle de l'AMT d'origine :

| Champ | Règle |
|---|---|
| Rappel de l'AMT | Titre, numéro, périmètre (« Entreprise (code) +N »), et sélecteur du statut de l'AMT. Un changement de statut est appliqué à l'enregistrement. |
| Type d'évènement * | *Autre type d'évènement uniquement* : Rédaction, ou Autre type d'évènement. |
| Titre de l'évènement * | Prérempli avec le titre de l'AMT. |
| Description | Facultative, révélée par le lien « + Ajouter une description ». |
| Date *, Début *, Fin * | Date du jour par défaut, horaires vides. La fin doit être après le début (« L'horaire de fin doit être ultérieur à l'horaire de début »). |
| Intervenants * | Sélecteur avancé multiple : recherche, favoris (étoile), récents, suggestions. Par défaut : l'utilisateur connecté. |
| Trouver un créneau disponible | Bouton sous les intervenants. Planning non reproduit dans le prototype. |
| Adresse de l'intervention * | *Intervention uniquement.* Préremplie avec l'adresse de l'adhérent ; désactivée si « En visio ». |
| En visio | *Intervention uniquement.* Masque et vide les trajets. |
| Contacts sur place | *Intervention uniquement*, facultatif. |
| Trajet aller / retour | *Intervention uniquement*, facultatifs, ajoutés par lien. Chacun : type d'horaire (Départ à / Arrivée à), horaire, point de départ ou d'arrivée, durée recommandée (« Appliquer »), durée en minutes * . « Supprimer » retire le trajet. |
| Partage avec l'adhérent | *Intervention uniquement* : Non partagé (par défaut) ou Partagé avec l'adhérent. |

- **RG-E4 — Création.** Les champs obligatoires sont contrôlés dans l'ordre ; le premier en erreur est signalé sous le champ. À l'enregistrement :
  - **une occurrence est créée par intervenant sélectionné**, toutes liées par le même identifiant de rendez-vous (voir §0) ;
  - le temps prévu de l'horaire va dans Intervention (intervention) ou Rédaction (autre type) ; la somme des trajets, convertie en heures, va dans Trajet ;
  - le type affiché est « Intervention », « Intervention en visio », « Rédaction » ou « Autre type d'évènement » ;
  - toast « Intervention ajoutée » / « Évènement ajouté », annulable ; création tracée ; le nouvel évènement s’affiche replié.

#### Modification

« ⋮ › Modifier l'évènement » ouvre **la même modale que la création**, préremplie avec l'évènement. Chaque champ peut être modifié.

- Titre « Modifier l'intervention » ou « Modifier l'évènement », bouton « Enregistrer ». La variante (intervention ou autre type) est celle de l'évènement ; elle ne se change pas depuis la modale.
- Préremplissage : type, titre, description, date, horaires, intervenants (tous les participants du rendez-vous), adresse, visio, contact, trajets, partage. Pour un évènement dont seul le trajet prévu en heures est connu, le trajet est réparti à parts égales entre un trajet aller et un trajet retour.

- **RG-E5 — Modification.** Le temps prévu de la catégorie principale est recalculé à partir de l'horaire, le trajet reprend la somme des trajets du formulaire, le temps de rédaction prévu d'une intervention est conservé. Les champs communs (titre, date, horaires, temps prévu…) s’appliquent à toutes les occurrences du rendez-vous ; les temps réels et le compte rendu de chaque occurrence ne sont pas modifiés. **Un intervenant ajouté reçoit une nouvelle occurrence**, liée au rendez-vous et sans temps réel ; **un intervenant retiré perd son occurrence** (temps réel et compte rendu compris, annulable depuis le toast). Un changement du statut de l'AMT est appliqué. La modification est tracée et annulable.

**Points ouverts**

- « Autre type d'évènement » est compté comme une rédaction : son compte rendu devient obligatoire. Est-ce voulu ?
- Retirer un participant qui a déjà saisi son temps réel est autorisé (son temps est supprimé avec son occurrence). Ce droit sera probablement réservé à un rôle administrateur : *à définir*.
- Un administrateur pourra probablement consulter le temps de tous les participants : *à définir*. Aujourd’hui, chacun ne voit que le sien, et le statut et les alertes de la ligne sont ceux de l’utilisateur connecté.

### 4.3 Statut d'un évènement

Le statut est calculé automatiquement et ne se modifie jamais à la main : la pastille est en lecture seule. Il n'existe pas de statut « Annulé » : un évènement à venir qui n'aura pas lieu est supprimé ; un évènement passé qui n'a pas eu lieu reçoit un temps réel de 0 avec une note.

| Statut | Condition |
|---|---|
| **Prévu** | Date à venir. |
| **À compléter** | Date passée et aucun temps réel saisi, **ou** rédaction sans compte rendu. |
| **Réalisé** | Date passée, temps réel saisi, et, pour une rédaction, compte rendu présent. |

- **RG-E6** — Saisir un temps réel sur un évènement passé le considère comme réalisé (pas de bouton de validation).
- **RG-E7 — Erreur « Planifié après l'échéance ».** Évènement à venir daté après l'échéance de l'AMT.

### 4.4 Détail d'un évènement (ligne dépliée)

**a. Messages.** Les erreurs et avertissements de l'évènement, avec leur explication. Exemple : « À compléter — L'évènement est passé : renseignez le temps réel (0 avec une note s'il n'a pas eu lieu). »

Le détail ne montre que **l’occurrence de l’utilisateur connecté** : il ne voit ni le temps réel ni le compte rendu des autres participants.

**b. Tableau du temps** — intitulé « Temps passé » (évènement passé) ou « Temps prévu » (à venir).

| Catégorie | Prévu (h) | Mon réel (h) |
|---|---|---|
| Intervention | modifiable | modifiable, **vide par défaut** |
| Rédaction | modifiable | modifiable, vide par défaut |
| Trajet | modifiable | modifiable, vide par défaut |
| **Total** | somme des prévus | somme des réels saisis, avec l'écart dans la même étiquette que les lignes (RG-E10) ; « — » si aucun réel saisi |

- **RG-E7b — Prévu commun, réel individuel.** Modifier un temps prévu le modifie pour tous les participants du rendez-vous ; le temps réel ne concerne que l’occurrence de l’utilisateur. Avec plusieurs participants, une mention sous le tableau le rappelle : « Temps prévu commun aux N participants · le temps réel est propre à chacun. »
- **RG-E7c — Non-participant.** Si l’utilisateur ne participe pas au rendez-vous, le détail n’affiche que le temps prévu, en lecture seule, avec la mention « Vous ne participez pas à cet évènement : chaque participant renseigne son propre temps réel. »
- **RG-E8** — Une rédaction n'affiche que la ligne Rédaction.
- **RG-E9** — Toutes les cellules sont en heures, par pas de 0,25. Les flèches haut et bas du clavier ajustent la valeur du champ actif.
- **RG-E10** — Un écart réel / prévu s'affiche à côté du réel (« +0,5 h » en orange, « −0,25 h » en vert).
- **RG-E11** — Chaque modification est tracée (avant → après) et annulable.
- **RG-E12** — Aucune phrase ni bouton de validation sous le tableau.

**c. Compte rendu**

- **RG-E13** — Facultatif pour une intervention (libellé « Compte rendu · facultatif »), obligatoire pour une rédaction (avertissement si absent).
- **RG-E14 — Texte ou fichier, pas les deux.** Un sélecteur « Rédiger / Joindre un fichier ».
  - Si un texte est saisi, « Joindre un fichier » est désactivé, avec l'explication « Un texte est rédigé : videz-le pour joindre un fichier à la place. »
  - Si un fichier est joint, « Rédiger » est désactivé, avec l'explication « Un fichier est joint : retirez-le pour rédiger à la place. »
  - Un seul fichier est accepté ; il peut être consulté ou retiré (retrait annulable).
- **RG-E15** — Le texte s'enregistre automatiquement. Ajout, modification et retrait sont tracés.

**Points ouverts**

- Valider « comme prévu » oblige à retaper la valeur prévue, la colonne Réel étant vide par défaut.
- Le prévu reste modifiable une fois l'évènement passé : est-ce voulu ?
- Les évènements à compléter se trouvent sous les évènements à venir (tri décroissant).
- Le libellé « Rédaction, autre évènement » apparaît encore dans le tableau du temps et dans la légende de la carte Temps.
- Avec RG-E16, sur un petit écran, une ligne dépliée peut occuper presque toute la hauteur du tableau.

---

## 5. Conclusion, intervenants et documents

**Objectif.** Clore l'AMT et retrouver qui intervient et quels documents s'y rattachent, sous la chronologie des évènements.

**Contenu.** Sous le tableau des évènements, dans la colonne principale :

- une carte **Conclusion**, pleine largeur : zone de texte libre ;
- puis, côte à côte, une carte **Intervenants** à gauche et une carte **Documents** à droite, alignées en haut. Sur un écran étroit, elles passent l'une sous l'autre.

**Règles de gestion**

- **RG-C1 — Conclusion.** Facultative. Enregistrée automatiquement à la sortie du champ ; la modification est tracée (avant → après) et annulable.
- **RG-C2 — Intervenants.** Titre « Intervenants » avec leur nombre ; chaque intervenant affiche avatar, nom et rôle, et peut être retiré (× , annulable). **Tout participant d’un évènement de l’AMT figure dans la liste** : il y est ajouté automatiquement à la création ou à la modification de l’évènement (ajout tracé, annulé avec l’évènement), et ne peut pas en être retiré tant qu’il a une occurrence (× désactivé avec l’infobulle « Participe à un évènement de l’AMT » ; case verrouillée dans la modale). « Ajouter » ouvre la modale « Modifier les intervenants » de l'AMT d'origine : une case à cocher par intervenant (nom et rôle), les intervenants actuels cochés, au moins un obligatoire (« Sélectionnez au moins une option »). « Enregistrer » applique la sélection ; toast « Intervenants modifiés », annulable ; modification tracée (avant → après).
- **RG-C3 — Documents.** Titre « Documents » avec le nombre de fichiers. La carte réunit, du plus récent au plus ancien :
  - les documents ajoutés directement à l'AMT : « Ajouter » accepte plusieurs fichiers ; ils peuvent être retirés depuis la carte (retrait annulable) ;
  - les fichiers joints en compte rendu aux évènements de l'AMT (§4.4 c), avec la mention « Compte rendu · titre de l'évènement ». Ils ne se retirent que depuis l'évènement.

  Chaque document affiche nom, auteur, date et taille, et peut être consulté ou téléchargé. Sans document : « Aucun document pour l'instant. »

**Points ouverts**

- Les comptes rendus rédigés en texte n'apparaissent pas dans Documents (seuls les fichiers joints y figurent).

---

## 6. Colonne latérale (Fiche · Activité)

*À spécifier.* Elle défile indépendamment de la colonne principale ; ses onglets restent visibles en haut (voir RG-E16). La Fiche contient : Périmètre, Demande, Classement (trois interrupteurs fixés en bas du panneau sous un séparateur, sans titre ; seul le contenu au-dessus défile). En bas de la partie défilante, « Étiquettes · N » : les deux premières sur une ligne chacune (tronquées, libellé complet au survol), puis « Voir les N autres ». Le bouton « Modifier » (ou « Ajouter » s’il n’y en a aucune) ouvre la modale « Modifier les étiquettes » : liste à cocher, Annuler / Enregistrer ; l’enregistrement est tracé et annulable. Conclusion, Intervenants et Documents sont dans la colonne principale (§5).
