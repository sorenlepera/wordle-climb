package com.wordle.service;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import io.quarkiverse.langchain4j.RegisterAiService;

@RegisterAiService
public interface WordGeneratorAI {

    @SystemMessage("Tu es un générateur de mots strict pour un jeu Wordle. Tu dois renvoyer EXACTEMENT UN SEUL MOT de 5 lettres en majuscules. Interdiction absolue d'ajouter de la ponctuation, des explications, ou du texte avant ou après le mot.")
    @UserMessage("""
        Génère un mot FRANÇAIS de 5 lettres pour le Niveau {level} d'un jeu Wordle.
        Le mot précédent était '{previousWord}'.
        
        Règles STRICTES:
        1. Le mot doit faire EXACTEMENT 5 lettres et exister dans le dictionnaire FRANÇAIS.
        2. La difficulté doit correspondre au niveau :
           - Niveau 1-5 : Mots très courants (ex: TABLE, PORTE, ROUGE, CHIEN).
           - Niveau 6-15 : Mots de difficulté moyenne (ex: MANGE, PIECE, FLUTE, SABLE).
           - Niveau 16+ : Mots rares ou complexes (ex: XENON, GIVRE, ZOUAK, HYMNE).
        3. FORMAT DE SORTIE IMPÉRATIF : Tu dois renvoyer 5 lettres et rien d'autre.
        
        Exemples de mauvaises réponses :
        - "Voici le mot: ARBRE" -> MAUVAIS
        - "Le mot est CHIEN" -> MAUVAIS
        - "POMMES" -> MAUVAIS (6 lettres)
        
        Exemples de bonnes réponses :
        - "ARBRE"
        - "CHIEN"
        
        Ta réponse (exactement 5 lettres en majuscules) :
        """)
    String generateNextWord(int level, String previousWord);

    @UserMessage("Reply exactly with the word 'ping' and nothing else.")
    String ping();
}
