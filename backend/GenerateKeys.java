import java.security.*;
import java.util.Base64;
import java.nio.file.*;

public class GenerateKeys {
    public static void main(String[] args) throws Exception {
        KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");
        keyPairGen.initialize(2048);
        KeyPair pair = keyPairGen.generateKeyPair();
        
        String privateKey = "-----BEGIN PRIVATE KEY-----\n" + 
            Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(pair.getPrivate().getEncoded()) + 
            "\n-----END PRIVATE KEY-----\n";
            
        String publicKey = "-----BEGIN PUBLIC KEY-----\n" + 
            Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(pair.getPublic().getEncoded()) + 
            "\n-----END PUBLIC KEY-----\n";
            
        Files.write(Paths.get("c:/Dev/learn-java/backend/src/main/resources/privateKey.pem"), privateKey.getBytes());
        Files.write(Paths.get("c:/Dev/learn-java/backend/src/main/resources/publicKey.pem"), publicKey.getBytes());
        System.out.println("Keys generated successfully.");
    }
}
