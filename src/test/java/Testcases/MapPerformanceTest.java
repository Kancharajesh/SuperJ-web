package Testcases;

import java.util.HashMap;
import java.util.Map;

public class MapPerformanceTest {

    public static void main(String[] args) {
        // Create a HashMap to store entries
        Map<String, Integer> map = new HashMap<>();

        // Get the start time
        long startTime = System.currentTimeMillis();

        // Add 40,000 entries to the HashMap
        for (int i = 0; i < 40000; i++) {
            String key = "key" + i;
            int value = i;
            map.put(key, value);
            
            // Print the key and value
            System.out.println("Added entry: " + key + " = " + value);
        }

        // Get the end time
        long endTime = System.currentTimeMillis();

        // Calculate the total time taken
        long totalTime = endTime - startTime;

        // Print the total time taken
        System.out.println("Total time to add 40,000 entries: " + totalTime + " ms");
    }
}
