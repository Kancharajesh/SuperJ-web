package Filereadres;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Properties;

public class proper {

	public static void main(String[] args) throws IOException {
		// TODO Auto-generated method stub

		FileReader fr = new FileReader(
				"C:\\Users\\Rajes\\eclipse-workspace\\superj-web\\src\\test\\java\\Filereadres\\DataFile");
		Properties p = new Properties();
		p.load(fr);

		FileReader pr = new FileReader(
				"C:\\Users\\Rajes\\eclipse-workspace\\superj-web\\src\\test\\java\\Filereadres\\IRCTC");
		Properties f = new Properties();
		f.load(pr);
		
		FileReader sr = new FileReader(
				"C:\\Users\\Rajes\\eclipse-workspace\\superj-web\\src\\test\\java\\Filereadres\\Survey types");
		Properties s = new Properties();
		s.load(sr);

	}

}
