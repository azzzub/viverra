package viverra

import org.apache.http.HttpEntity
import org.apache.http.client.methods.CloseableHttpResponse
import org.apache.http.client.methods.HttpPost
import org.apache.http.entity.ContentType
import org.apache.http.entity.mime.MultipartEntityBuilder
import org.apache.http.impl.client.CloseableHttpClient
import org.apache.http.impl.client.HttpClients

import com.kms.katalon.core.annotation.Keyword
import com.kms.katalon.core.util.KeywordUtil

import internal.GlobalVariable

public class ViverraService {
	ViverraService() {
		if (GlobalVariable.viverraCollectionID == "") {
			KeywordUtil.markError("Must register the collection ID first!")
		}
	}

	ViverraService(String collectionID) {
		GlobalVariable.viverraCollectionID = collectionID
	}

	@Keyword
	def clear(){
		GlobalVariable.viverraCollectionID = ""
	}

	private viverraHost = GlobalVariable.viverraHost
	private viverraApiSnapshotPath = '/api/snapshot'
	private viverraApiReportPath = '/api/report'

	@Keyword
	def compareSnapshot(String imageFilepath, name){
		try {
			CloseableHttpClient httpClient = HttpClients.createDefault();
			HttpPost uploadFile = new HttpPost(viverraHost + viverraApiSnapshotPath);
			MultipartEntityBuilder builder = MultipartEntityBuilder.create();
			builder.addTextBody("name", name, ContentType.TEXT_PLAIN);
			builder.addTextBody("collectionID", GlobalVariable.viverraCollectionID, ContentType.TEXT_PLAIN);

			// This attaches the file to the POST:
			File f = new File(imageFilepath);
			builder.addBinaryBody(
					"file",
					new FileInputStream(f),
					ContentType.APPLICATION_OCTET_STREAM,
					f.getName()
					)

			HttpEntity multipart = builder.build();
			uploadFile.setEntity(multipart);
			CloseableHttpResponse response = httpClient.execute(uploadFile);
			HttpEntity responseEntity = response.getEntity();
			return responseEntity
		} catch (err) {
			return err
		}
	}

	@Keyword
	def sendReport(){
		String query = "?collectionID=" + GlobalVariable.viverraCollectionID

		try {
			def get = new URL(viverraHost + viverraApiReportPath + query).openConnection() as HttpURLConnection;
			def getRC = get.getResponseCode();

			println(getRC);

			if (getRC.equals(200)) {
				println(get.getInputStream().getText());
			}
		} catch (err) {
			return err
		}
	}
}